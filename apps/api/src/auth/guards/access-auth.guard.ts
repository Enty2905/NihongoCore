import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { authExceptions } from '../common/auth-exceptions';
import type { AuthenticatedRequest } from '../common/auth-context';

@Injectable()
export class AccessAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      throw authExceptions.unauthenticated();
    }
    const token = authorization.slice('Bearer '.length);
    if (!token || token.includes(' ')) throw authExceptions.unauthenticated();
    request.auth = await this.auth.authenticateAccess(token);
    return true;
  }
}
