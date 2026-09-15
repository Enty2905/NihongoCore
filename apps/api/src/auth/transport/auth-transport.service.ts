import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, CookieOptions } from 'express';
import type { Environment } from '../../common/environment';
import { authExceptions } from '../common/auth-exceptions';

export type ClientPlatform = 'web' | 'native';

@Injectable()
export class AuthTransportService {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  validatePost(request: Request): ClientPlatform {
    const platform = request.get('x-client-platform');
    if (platform !== 'web' && platform !== 'native') {
      throw authExceptions.invalidTransport(
        'X-Client-Platform must be web or native.',
      );
    }

    const origin = request.get('origin');
    const browserSignal = origin || request.get('sec-fetch-site');
    if (platform === 'native') {
      if (browserSignal) {
        throw authExceptions.invalidTransport(
          'Browser requests cannot select native credential transport.',
        );
      }
      return platform;
    }

    if (
      !origin ||
      !this.config.get('CORS_ORIGINS', { infer: true }).includes(origin)
    ) {
      throw authExceptions.forbiddenOrigin();
    }
    if (request.get('x-csrf-protection') !== '1') {
      throw authExceptions.invalidTransport('CSRF protection is required.');
    }
    return platform;
  }

  refreshCredential(
    request: Request,
    platform: ClientPlatform,
    bodyToken: string | undefined,
  ): string | undefined {
    const cookieToken = (
      request.cookies as Record<string, unknown> | undefined
    )?.[this.cookieName];
    if (platform === 'web') {
      if (bodyToken) {
        throw authExceptions.invalidTransport(
          'Web refresh credentials must use the HttpOnly cookie.',
        );
      }
      return typeof cookieToken === 'string' ? cookieToken : undefined;
    }
    if (cookieToken) {
      throw authExceptions.invalidTransport(
        'Native refresh requests cannot use browser cookies.',
      );
    }
    return bodyToken;
  }

  issueRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(this.cookieName, refreshToken, {
      ...this.cookieOptions,
      maxAge:
        this.config.get('AUTH_REFRESH_IDLE_TTL_SECONDS', { infer: true }) *
        1000,
    });
  }

  clearRefreshCookie(response: Response): void {
    response.clearCookie(this.cookieName, this.cookieOptions);
  }

  private get cookieName(): string {
    return this.config.get('AUTH_REFRESH_COOKIE_NAME', { infer: true });
  }

  private get cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
    };
  }
}
