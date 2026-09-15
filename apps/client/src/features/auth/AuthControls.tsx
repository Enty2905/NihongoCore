import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { authColors } from './theme';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  optionalLabel?: string;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
}

export function AuthField({
  label,
  error,
  optionalLabel,
  passwordVisible,
  onTogglePassword,
  ...inputProps
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.group}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optionalLabel ? (
          <Text style={styles.optional}>{optionalLabel}</Text>
        ) : null}
      </View>
      <View style={styles.inputWrap}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          accessibilityHint={error}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          style={[
            styles.input,
            onTogglePassword && styles.passwordInput,
            focused && styles.inputFocused,
            error && styles.inputError,
          ]}
        />
        {onTogglePassword ? (
          <Pressable
            accessibilityLabel={
              passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
            }
            accessibilityRole="button"
            onPress={onTogglePassword}
            style={({ pressed }) => [
              styles.visibility,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.visibilityText}>
              {passwordVisible ? 'Ẩn' : 'Hiện'}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

interface ButtonProps {
  label: string;
  busyLabel: string;
  busy: boolean;
  onPress(): void;
  variant?: 'primary' | 'secondary';
}

export function AuthButton({
  label,
  busyLabel,
  busy,
  onPress,
  variant = 'primary',
}: ButtonProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        focused && styles.buttonFocused,
        (pressed || busy) && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.buttonSecondaryText,
        ]}
      >
        {busy ? busyLabel : label}
      </Text>
    </Pressable>
  );
}

export function AuthLink({
  label,
  onPress,
}: {
  label: string;
  onPress(): void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={[authControlStyles.switch, focused && styles.linkFocused]}
    >
      <Text style={authControlStyles.switchText}>{label}</Text>
    </Pressable>
  );
}

export function FormMessage({
  children,
  tone = 'error',
}: {
  children: string;
  tone?: 'error' | 'success';
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.message, tone === 'success' && styles.successMessage]}
    >
      <Text
        style={[styles.messageText, tone === 'success' && styles.successText]}
      >
        {children}
      </Text>
    </View>
  );
}

export const authControlStyles = StyleSheet.create({
  form: { gap: 20 },
  helper: {
    color: authColors.secondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: -8,
  },
  switch: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  switchText: {
    color: authColors.ink,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});

const styles = StyleSheet.create({
  group: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: authColors.ink, fontSize: 15, fontWeight: '600' },
  optional: { color: authColors.secondary, fontSize: 14 },
  inputWrap: { position: 'relative' },
  input: {
    backgroundColor: authColors.page,
    borderColor: authColors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: authColors.ink,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  passwordInput: { paddingRight: 76 },
  inputFocused: { borderColor: authColors.focus, borderWidth: 2 },
  inputError: { borderColor: authColors.error },
  visibility: {
    alignItems: 'center',
    bottom: 3,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 60,
    position: 'absolute',
    right: 3,
    top: 3,
  },
  visibilityText: { color: authColors.secondary, fontSize: 15 },
  error: { color: authColors.error, fontSize: 14, lineHeight: 21 },
  button: {
    alignItems: 'center',
    backgroundColor: authColors.action,
    borderColor: authColors.action,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 18,
  },
  buttonSecondary: { backgroundColor: 'transparent' },
  buttonFocused: { borderColor: authColors.focus, borderWidth: 2 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  buttonSecondaryText: { color: authColors.action },
  pressed: { opacity: 0.68 },
  linkFocused: {
    borderColor: authColors.focus,
    borderRadius: 8,
    borderWidth: 2,
  },
  message: {
    backgroundColor: authColors.errorBackground,
    borderColor: authColors.error,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  messageText: { color: authColors.error, fontSize: 14, lineHeight: 22 },
  successMessage: {
    backgroundColor: authColors.account,
    borderColor: authColors.line,
  },
  successText: { color: authColors.ink },
});
