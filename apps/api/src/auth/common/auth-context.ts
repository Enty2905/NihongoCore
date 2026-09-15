import type { Request } from 'express';
import type { SafeUser } from '../../users/users.service';

export interface AuthenticatedContext {
  sessionId: string;
  user: SafeUser;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthenticatedContext;
}

export interface IssuedAuthentication {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}
