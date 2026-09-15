import { HttpException, HttpStatus } from '@nestjs/common';

function authError(
  status: HttpStatus,
  code: string,
  message: string,
): HttpException {
  return new HttpException({ code, message, details: {} }, status);
}

export const authExceptions = {
  emailExists: () =>
    authError(
      HttpStatus.CONFLICT,
      'EMAIL_ALREADY_EXISTS',
      'Email này đã được sử dụng.',
    ),
  invalidCredentials: () =>
    authError(
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS',
      'Email hoặc mật khẩu không đúng.',
    ),
  unauthenticated: () =>
    authError(
      HttpStatus.UNAUTHORIZED,
      'UNAUTHENTICATED',
      'Authentication is required.',
    ),
  invalidRefresh: () =>
    authError(
      HttpStatus.UNAUTHORIZED,
      'INVALID_REFRESH_TOKEN',
      'The refresh credential is invalid or expired.',
    ),
  refreshReused: () =>
    authError(
      HttpStatus.UNAUTHORIZED,
      'REFRESH_TOKEN_REUSED',
      'The session can no longer be refreshed.',
    ),
  invalidTransport: (message = 'Invalid authentication transport.') =>
    authError(HttpStatus.BAD_REQUEST, 'INVALID_AUTH_TRANSPORT', message),
  forbiddenOrigin: () =>
    authError(
      HttpStatus.FORBIDDEN,
      'ORIGIN_NOT_ALLOWED',
      'The request origin is not allowed.',
    ),
  serviceUnavailable: () =>
    authError(
      HttpStatus.SERVICE_UNAVAILABLE,
      'AUTH_SERVICE_UNAVAILABLE',
      'Authentication is temporarily unavailable.',
    ),
};
