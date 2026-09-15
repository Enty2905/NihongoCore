import { StyleSheet, Text, View } from 'react-native';
import { AuthButton, FormMessage } from './AuthControls';
import { AuthPageLayout } from './AuthPageLayout';
import { authColors } from './theme';
import type { AuthStatus, SafeUser } from './types';

interface Props {
  status: AuthStatus;
  user: SafeUser | null;
  onLogout(): Promise<void>;
  onRetryLogout(): Promise<void>;
}

export function AccountShell({ status, user, onLogout, onRetryLogout }: Props) {
  return (
    <AuthPageLayout>
      {status === 'logging-out' ? (
        <View accessibilityLiveRegion="polite" style={styles.state}>
          <Text style={styles.stateTitle}>Đang đăng xuất…</Text>
          <Text style={styles.stateBody}>
            Thông tin riêng tư đã được ẩn trong khi xác nhận phiên.
          </Text>
        </View>
      ) : status === 'logout-error' ? (
        <View style={styles.state}>
          <FormMessage>Chưa xác nhận được đăng xuất.</FormMessage>
          <AuthButton
            busy={false}
            busyLabel="Đang thử lại…"
            label="Thử lại"
            onPress={() => void onRetryLogout()}
          />
        </View>
      ) : (
        <View style={styles.account}>
          <Text accessibilityRole="header" style={styles.title}>
            Tài khoản
          </Text>
          <View style={styles.identity}>
            {user?.displayName ? (
              <Text style={styles.name}>{user.displayName}</Text>
            ) : null}
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <AuthButton
            busy={false}
            busyLabel="Đang đăng xuất…"
            label="Đăng xuất"
            onPress={() => void onLogout()}
            variant="secondary"
          />
        </View>
      )}
    </AuthPageLayout>
  );
}

const styles = StyleSheet.create({
  account: {
    backgroundColor: authColors.account,
    borderColor: authColors.line,
    borderRadius: 14,
    borderWidth: 1,
    gap: 24,
    padding: 28,
  },
  title: { color: authColors.ink, fontSize: 24, fontWeight: '700' },
  identity: { gap: 6 },
  name: { color: authColors.ink, fontSize: 18, fontWeight: '600' },
  email: { color: authColors.secondary, fontSize: 16 },
  state: { gap: 20 },
  stateTitle: { color: authColors.ink, fontSize: 24, fontWeight: '700' },
  stateBody: { color: authColors.secondary, fontSize: 16, lineHeight: 25 },
});
