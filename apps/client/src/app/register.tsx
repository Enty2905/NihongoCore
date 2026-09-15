import { Redirect, useRouter } from 'expo-router';
import { AuthPageLayout } from '../features/auth/AuthPageLayout';
import { useAuth } from '../features/auth/AuthProvider';
import { RegisterForm } from '../features/auth/RegisterForm';

export default function RegisterScreen() {
  const auth = useAuth();
  const router = useRouter();
  if (auth.status === 'authenticated') return <Redirect href="/account" />;
  if (auth.status === 'logging-out' || auth.status === 'logout-error') {
    return <Redirect href="/account" />;
  }
  return (
    <AuthPageLayout title="Tạo tài khoản">
      <RegisterForm
        onSubmit={auth.register}
        onSwitch={() => router.replace('/login')}
      />
    </AuthPageLayout>
  );
}
