import { Redirect, useRouter } from 'expo-router';
import { AuthPageLayout } from '../features/auth/AuthPageLayout';
import { useAuth } from '../features/auth/AuthProvider';
import { LoginForm } from '../features/auth/LoginForm';

export default function LoginScreen() {
  const auth = useAuth();
  const router = useRouter();
  if (auth.status === 'authenticated') return <Redirect href="/account" />;
  if (auth.status === 'logging-out' || auth.status === 'logout-error') {
    return <Redirect href="/account" />;
  }
  return (
    <AuthPageLayout title="Đăng nhập">
      <LoginForm
        notice={auth.notice}
        onSubmit={auth.login}
        onSwitch={() => router.replace('/register')}
      />
    </AuthPageLayout>
  );
}
