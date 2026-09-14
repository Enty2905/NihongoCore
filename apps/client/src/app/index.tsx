import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getHealth } from '../services/api/health';

export default function DevelopmentHome() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => getHealth(signal),
  });

  return (
    <View style={styles.page}>
      <View style={styles.panel}>
        <Text accessibilityRole="header" style={styles.title}>
          NihongoCore
        </Text>
        <Text style={styles.subtitle}>Engineering foundation · M1</Text>
        <Text style={styles.sample}>日本語を学ぶ · Học tiếng Nhật</Text>
        <Text style={styles.body}>
          Expo Router is running. This development shell checks the connection
          to the API.
        </Text>
        <View accessibilityLiveRegion="polite" style={styles.status}>
          {health.isFetching ? (
            <Text>Checking API…</Text>
          ) : health.isError ? (
            <Text style={styles.error}>{health.error.message}</Text>
          ) : (
            <Text>API status: {health.data?.status}</Text>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check API connection again"
          accessibilityState={{ disabled: health.isFetching }}
          disabled={health.isFetching}
          onPress={() => void health.refetch()}
          style={({ pressed }) => [
            styles.button,
            (pressed || health.isFetching) && styles.buttonMuted,
          ]}
        >
          <Text style={styles.buttonText}>
            {health.isFetching ? 'Checking…' : 'Check again'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 560,
    padding: 28,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    gap: 20,
  },
  title: { fontSize: 32, fontWeight: '700', color: '#13293d' },
  subtitle: { fontSize: 16, color: '#475569' },
  sample: { fontSize: 22, lineHeight: 34, color: '#13293d' },
  body: { fontSize: 16, lineHeight: 25, color: '#334155' },
  status: { padding: 16, borderRadius: 8, backgroundColor: '#eef2f6' },
  error: { color: '#9b1c1c' },
  button: {
    minHeight: 48,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#164e63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMuted: { opacity: 0.65 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
