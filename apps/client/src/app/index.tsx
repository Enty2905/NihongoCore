import { Redirect } from 'expo-router';
import { AuthStatusView } from '../features/auth/AuthStatusView';
import { useAuth } from '../features/auth/AuthProvider';

export default function AuthenticationEntry() {
  const auth = useAuth();
  if (auth.status === 'bootstrapping') return <AuthStatusView />;
  if (auth.status === 'bootstrap-error') {
    return <AuthStatusView error onRetry={() => void auth.retryBootstrap()} />;
  }
  if (auth.status === 'authenticated') {
    return <Redirect href="/account" />;
  }
  if (auth.status === 'logging-out' || auth.status === 'logout-error') {
    return <Redirect href="/account" />;
  }
  return <Redirect href="/login" />;
}
