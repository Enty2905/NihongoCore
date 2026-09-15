export interface SafeUser {
  id: string;
  email: string;
  displayName: string | null;
}

export type AuthStatus =
  | 'bootstrapping'
  | 'authenticated'
  | 'unauthenticated'
  | 'bootstrap-error'
  | 'logging-out'
  | 'logout-error';
