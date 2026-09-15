import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AuthButton } from './AuthControls';
import { AuthPageLayout } from './AuthPageLayout';
import { authColors } from './theme';

export function AuthStatusView({
  error = false,
  onRetry,
}: {
  error?: boolean;
  onRetry?: () => void;
}) {
  return (
    <AuthPageLayout>
      <View accessibilityLiveRegion="polite" style={styles.content}>
        {error ? (
          <>
            <Text accessibilityRole="header" style={styles.title}>
              Không thể kiểm tra phiên
            </Text>
            <Text style={styles.body}>Kiểm tra kết nối rồi thử lại.</Text>
            {onRetry ? (
              <AuthButton
                busy={false}
                busyLabel="Đang thử lại…"
                label="Thử lại"
                onPress={onRetry}
              />
            ) : null}
          </>
        ) : (
          <>
            <ActivityIndicator color={authColors.action} size="small" />
            <Text style={styles.body}>Đang kiểm tra phiên đăng nhập…</Text>
          </>
        )}
      </View>
    </AuthPageLayout>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'flex-start', gap: 18 },
  title: { color: authColors.ink, fontSize: 26, fontWeight: '700' },
  body: { color: authColors.secondary, fontSize: 16, lineHeight: 25 },
});
