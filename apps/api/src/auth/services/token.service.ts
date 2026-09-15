import { createHmac, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Environment } from '../../common/environment';
import { authExceptions } from '../common/auth-exceptions';

interface AccessClaims {
  sub: string;
  sid: string;
  typ: 'access';
}

@Injectable()
export class TokenService {
  constructor(
    private readonly config: ConfigService<Environment, true>,
    private readonly jwt: JwtService,
  ) {}

  createRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return createHmac(
      'sha256',
      this.config.get('JWT_REFRESH_SECRET', { infer: true }),
    )
      .update(token, 'utf8')
      .digest('hex');
  }

  issueAccessToken(userId: string, sessionId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, sid: sessionId, typ: 'access' } satisfies AccessClaims,
      {
        algorithm: 'HS256',
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: this.config.get('JWT_ACCESS_TTL_SECONDS', { infer: true }),
        issuer: this.config.get('AUTH_JWT_ISSUER', { infer: true }),
        audience: this.config.get('AUTH_JWT_AUDIENCE', { infer: true }),
      },
    );
  }

  async verifyAccessToken(token: string): Promise<AccessClaims> {
    try {
      const claims = await this.jwt.verifyAsync<AccessClaims>(token, {
        algorithms: ['HS256'],
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        issuer: this.config.get('AUTH_JWT_ISSUER', { infer: true }),
        audience: this.config.get('AUTH_JWT_AUDIENCE', { infer: true }),
      });
      if (
        claims.typ !== 'access' ||
        typeof claims.sub !== 'string' ||
        typeof claims.sid !== 'string'
      ) {
        throw authExceptions.unauthenticated();
      }
      return claims;
    } catch {
      throw authExceptions.unauthenticated();
    }
  }
}
