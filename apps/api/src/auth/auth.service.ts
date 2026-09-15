import { randomUUID } from 'node:crypto';
import { HttpException, Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { authExceptions } from './common/auth-exceptions';
import type {
  AuthenticatedContext,
  IssuedAuthentication,
} from './common/auth-context';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
  ) {}

  async register(input: RegisterInput): Promise<IssuedAuthentication> {
    const email = this.normalizeEmail(input.email);
    const displayName = this.normalizeDisplayName(input.displayName);
    const passwordHash = await this.passwords.hash(input.password);
    const userId = randomUUID();
    const prepared = await this.sessions.prepare(userId);

    try {
      const user = await this.prisma.$transaction(async (transaction) => {
        const created = await transaction.user.create({
          data: { id: userId, email, displayName, passwordHash },
        });
        await this.sessions.createRecord(transaction, userId, prepared);
        return created;
      });
      return {
        accessToken: prepared.accessToken,
        refreshToken: prepared.refreshToken,
        user: this.users.toSafeUser(user),
      };
    } catch (error) {
      if (this.isPrismaError(error, 'P2002')) {
        throw authExceptions.emailExists();
      }
      throw authExceptions.serviceUnavailable();
    }
  }

  async login(input: LoginInput): Promise<IssuedAuthentication> {
    try {
      const user = await this.users.findByEmail(
        this.normalizeEmail(input.email),
      );
      const passwordMatches = await this.passwords.verify(
        user?.passwordHash ?? null,
        input.password,
      );
      if (!user || !passwordMatches) {
        throw authExceptions.invalidCredentials();
      }
      return await this.sessions.createForUser(this.users.toSafeUser(user));
    } catch (error) {
      this.rethrowSafe(error);
    }
  }

  async refresh(rawToken: string): Promise<IssuedAuthentication> {
    try {
      return await this.sessions.refresh(rawToken);
    } catch (error) {
      this.rethrowSafe(error);
    }
  }

  async logout(rawToken: string | undefined): Promise<void> {
    try {
      await this.sessions.logout(rawToken);
    } catch (error) {
      this.rethrowSafe(error);
    }
  }

  async authenticateAccess(
    rawAccessToken: string,
  ): Promise<AuthenticatedContext> {
    try {
      return await this.sessions.authenticateAccess(rawAccessToken);
    } catch (error) {
      this.rethrowSafe(error);
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeDisplayName(displayName: string | undefined): string | null {
    const normalized = displayName?.trim();
    return normalized ? normalized : null;
  }

  private isPrismaError(error: unknown, code: string): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as Prisma.PrismaClientKnownRequestError).code === code
    );
  }

  private rethrowSafe(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw authExceptions.serviceUnavailable();
  }
}
