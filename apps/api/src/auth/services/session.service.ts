import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma, User } from '../../generated/prisma/client';
import type { Environment } from '../../common/environment';
import { PrismaService } from '../../database/prisma.service';
import { type SafeUser, UsersService } from '../../users/users.service';
import {
  type AuthenticatedContext,
  type IssuedAuthentication,
} from '../common/auth-context';
import { authExceptions } from '../common/auth-exceptions';
import { ClockService } from './clock.service';
import { TokenService } from './token.service';

interface PreparedSession {
  sessionId: string;
  refreshTokenId: string;
  refreshToken: string;
  tokenHash: string;
  accessToken: string;
  now: Date;
  expiresAt: Date;
  absoluteExpiresAt: Date;
}

type RefreshResult =
  | { kind: 'invalid' }
  | { kind: 'reused' }
  | {
      kind: 'ok';
      user: User;
      sessionId: string;
      refreshToken: string;
    };

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Environment, true>,
    private readonly clock: ClockService,
    private readonly tokens: TokenService,
    private readonly users: UsersService,
  ) {}

  async prepare(userId: string): Promise<PreparedSession> {
    const now = this.clock.now();
    const absoluteExpiresAt = this.addSeconds(
      now,
      this.config.get('AUTH_SESSION_ABSOLUTE_TTL_SECONDS', { infer: true }),
    );
    const expiresAt = this.minimumDate(
      this.addSeconds(
        now,
        this.config.get('AUTH_REFRESH_IDLE_TTL_SECONDS', { infer: true }),
      ),
      absoluteExpiresAt,
    );
    const sessionId = randomUUID();
    const refreshToken = this.tokens.createRefreshToken();
    return {
      sessionId,
      refreshTokenId: randomUUID(),
      refreshToken,
      tokenHash: this.tokens.hashRefreshToken(refreshToken),
      accessToken: await this.tokens.issueAccessToken(userId, sessionId),
      now,
      expiresAt,
      absoluteExpiresAt,
    };
  }

  async createRecord(
    transaction: Prisma.TransactionClient,
    userId: string,
    prepared: PreparedSession,
  ): Promise<void> {
    await transaction.authSession.create({
      data: {
        id: prepared.sessionId,
        userId,
        createdAt: prepared.now,
        lastUsedAt: prepared.now,
        expiresAt: prepared.expiresAt,
        absoluteExpiresAt: prepared.absoluteExpiresAt,
        refreshTokens: {
          create: {
            id: prepared.refreshTokenId,
            tokenHash: prepared.tokenHash,
            createdAt: prepared.now,
            expiresAt: prepared.expiresAt,
          },
        },
      },
    });
  }

  async createForUser(user: SafeUser): Promise<IssuedAuthentication> {
    const prepared = await this.prepare(user.id);
    await this.prisma.$transaction((transaction) =>
      this.createRecord(transaction, user.id, prepared),
    );
    return {
      accessToken: prepared.accessToken,
      refreshToken: prepared.refreshToken,
      user,
    };
  }

  async refresh(rawToken: string): Promise<IssuedAuthentication> {
    const tokenHash = this.tokens.hashRefreshToken(rawToken);
    const result = await this.serializable(async (transaction) => {
      const current = await transaction.refreshToken.findUnique({
        where: { tokenHash },
        include: { session: { include: { user: true } } },
      });
      if (!current) return { kind: 'invalid' } satisfies RefreshResult;

      const now = this.clock.now();
      if (current.consumedAt || current.revokedAt) {
        await this.revokeFamily(transaction, current.sessionId, now, 'reuse');
        return { kind: 'reused' } satisfies RefreshResult;
      }

      const session = current.session;
      if (session.revokedAt) {
        return { kind: 'invalid' } satisfies RefreshResult;
      }
      if (
        current.expiresAt <= now ||
        session.expiresAt <= now ||
        session.absoluteExpiresAt <= now
      ) {
        await this.revokeFamily(transaction, current.sessionId, now, 'expired');
        return { kind: 'invalid' } satisfies RefreshResult;
      }

      const claimed = await transaction.refreshToken.updateMany({
        where: {
          id: current.id,
          consumedAt: null,
          revokedAt: null,
        },
        data: { consumedAt: now },
      });
      if (claimed.count !== 1) {
        await this.revokeFamily(transaction, current.sessionId, now, 'reuse');
        return { kind: 'reused' } satisfies RefreshResult;
      }

      const refreshToken = this.tokens.createRefreshToken();
      const successorId = randomUUID();
      const expiresAt = this.minimumDate(
        this.addSeconds(
          now,
          this.config.get('AUTH_REFRESH_IDLE_TTL_SECONDS', { infer: true }),
        ),
        session.absoluteExpiresAt,
      );
      await transaction.refreshToken.create({
        data: {
          id: successorId,
          sessionId: current.sessionId,
          tokenHash: this.tokens.hashRefreshToken(refreshToken),
          createdAt: now,
          expiresAt,
        },
      });
      await transaction.refreshToken.update({
        where: { id: current.id },
        data: { replacedById: successorId },
      });
      await transaction.authSession.update({
        where: { id: current.sessionId },
        data: { lastUsedAt: now, expiresAt },
      });
      return {
        kind: 'ok',
        user: session.user,
        sessionId: session.id,
        refreshToken,
      } satisfies RefreshResult;
    });

    if (result.kind === 'invalid') throw authExceptions.invalidRefresh();
    if (result.kind === 'reused') throw authExceptions.refreshReused();

    return {
      accessToken: await this.tokens.issueAccessToken(
        result.user.id,
        result.sessionId,
      ),
      refreshToken: result.refreshToken,
      user: this.users.toSafeUser(result.user),
    };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.tokens.hashRefreshToken(rawToken);
    await this.prisma.$transaction(async (transaction) => {
      const token = await transaction.refreshToken.findUnique({
        where: { tokenHash },
        select: { sessionId: true },
      });
      if (!token) return;
      await this.revokeFamily(
        transaction,
        token.sessionId,
        this.clock.now(),
        'logout',
      );
    });
  }

  async authenticateAccess(
    rawAccessToken: string,
  ): Promise<AuthenticatedContext> {
    const claims = await this.tokens.verifyAccessToken(rawAccessToken);
    const session = await this.prisma.authSession.findFirst({
      where: { id: claims.sid, userId: claims.sub },
      include: { user: true },
    });
    const now = this.clock.now();
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= now ||
      session.absoluteExpiresAt <= now
    ) {
      throw authExceptions.unauthenticated();
    }
    return {
      sessionId: session.id,
      user: this.users.toSafeUser(session.user),
    };
  }

  private async revokeFamily(
    transaction: Prisma.TransactionClient,
    sessionId: string,
    now: Date,
    reason: 'logout' | 'reuse' | 'expired',
  ): Promise<void> {
    await transaction.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: now, revocationReason: reason },
    });
    await transaction.refreshToken.updateMany({
      where: { sessionId, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  private async serializable<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(operation, {
          isolationLevel: 'Serializable',
        });
      } catch (error) {
        const serializationConflict =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2034';
        if (serializationConflict) {
          if (attempt < 2) continue;
          throw authExceptions.serviceUnavailable();
        }
        throw error;
      }
    }
    throw authExceptions.serviceUnavailable();
  }

  private addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
  }

  private minimumDate(first: Date, second: Date): Date {
    return first <= second ? first : second;
  }
}
