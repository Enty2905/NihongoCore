import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { authColors } from './theme';

interface Props extends PropsWithChildren {
  title?: string;
}

export function AuthPageLayout({ children, title }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}
      >
        <View style={[styles.page, wide && styles.pageWide]}>
          <View style={[styles.identity, wide && styles.identityWide]}>
            <View style={styles.identityInner}>
              <Text accessibilityRole="header" style={styles.wordmark}>
                NihongoCore
              </Text>
              <Text style={styles.japanese}>日本語を学ぶ · Học tiếng Nhật</Text>
              {wide ? (
                <Text style={styles.identityBody}>
                  Một không gian riêng cho việc học tiếng Nhật.
                </Text>
              ) : null}
            </View>
          </View>
          <ScrollView
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={[styles.content, wide && styles.contentWide]}
            keyboardShouldPersistTaps="handled"
            style={[styles.scroll, wide && styles.scrollWide]}
          >
            <View style={styles.formColumn}>
              {title ? (
                <Text accessibilityRole="header" style={styles.heading}>
                  {title}
                </Text>
              ) : null}
              {children}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: authColors.page },
  page: { flex: 1, backgroundColor: authColors.surface },
  pageWide: { flexDirection: 'row' },
  identity: {
    backgroundColor: authColors.page,
    borderBottomColor: authColors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  identityWide: {
    borderBottomWidth: 0,
    borderRightColor: authColors.line,
    borderRightWidth: StyleSheet.hairlineWidth,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    paddingHorizontal: 64,
    width: '40%',
  },
  identityInner: { gap: 8 },
  wordmark: { color: authColors.ink, fontSize: 28, fontWeight: '700' },
  japanese: {
    color: authColors.secondary,
    fontSize: 17,
    lineHeight: 28,
  },
  identityBody: {
    color: authColors.secondary,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 24,
  },
  scroll: { flex: 1 },
  scrollWide: {
    flexBasis: '60%',
    flexGrow: 0,
    flexShrink: 0,
    width: '60%',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  contentWide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    paddingVertical: 64,
  },
  formColumn: { gap: 24, maxWidth: 440, width: '100%' },
  heading: {
    color: authColors.ink,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
  },
});
