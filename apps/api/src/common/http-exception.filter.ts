import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const body =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const payload =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const serverError = status >= 500;

    if (serverError) {
      // Never log request bodies, configuration, or untrusted exception messages.
      this.logger.error('Request failed with an internal server error');
    }

    response.status(status).json({
      statusCode: status,
      code: serverError
        ? 'INTERNAL_SERVER_ERROR'
        : typeof payload.code === 'string'
          ? payload.code
          : (HttpStatus[status] ?? 'HTTP_ERROR'),
      message: serverError
        ? 'Internal server error'
        : typeof payload.message === 'string'
          ? payload.message
          : typeof body === 'string'
            ? body
            : 'Request failed',
      details: serverError ? {} : (payload.details ?? {}),
    });
  }
}
