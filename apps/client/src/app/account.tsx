import { Redirect } from 'expo-router';
import { AccountShell } from '../features/auth/AccountShell';
import { AuthStatusView } from '../features/auth/AuthStatusView';
import { useAuth } from '../features/auth/AuthProvider';

export default function AccountScreen() {
  const auth = useAuth();
  if (auth.status === 'bootstrapping') return <AuthStatusView />;
  if (auth.status === 'bootstrap-error') {
    return <AuthStatusView error onRetry={() => void auth.retryBootstrap()} />;
  }
  if (auth.status === 'unauthenticated') return <Redirect href="/login" />;
  return (
    <AccountShell
      onLogout={auth.logout}
      onRetryLogout={auth.retryLogout}
      status={auth.status}
      user={auth.user}
    />
  );
}
