import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { ApiError } from '../../services/api/client';
import {
  AuthButton,
  AuthField,
  AuthLink,
  FormMessage,
  authControlStyles,
} from './AuthControls';
import { loginSchema, type LoginValues } from './schemas';

interface Props {
  notice?: string | null;
  onSubmit(values: LoginValues): Promise<void>;
  onSwitch(): void;
}

export function LoginForm({ notice, onSubmit, onSwitch }: Props) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(
          error.code === 'INVALID_CREDENTIALS'
            ? 'Email hoặc mật khẩu không đúng.'
            : error.message,
        );
      } else {
        setServerError('Không thể đăng nhập. Vui lòng thử lại.');
      }
    }
  });

  return (
    <View style={authControlStyles.form}>
      {notice ? <FormMessage tone="success">{notice}</FormMessage> : null}
      {serverError ? <FormMessage>{serverError}</FormMessage> : null}
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <AuthField
            autoCapitalize="none"
            autoComplete="email"
            error={fieldState.error?.message}
            inputMode="email"
            keyboardType="email-address"
            label="Email"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="Địa chỉ email"
            returnKeyType="next"
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <AuthField
            autoComplete="current-password"
            error={fieldState.error?.message}
            label="Mật khẩu"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            onSubmitEditing={() => void submit()}
            onTogglePassword={() => setPasswordVisible((value) => !value)}
            passwordVisible={passwordVisible}
            placeholder="Mật khẩu"
            returnKeyType="done"
            secureTextEntry={!passwordVisible}
            value={field.value}
          />
        )}
      />
      <AuthButton
        busy={isSubmitting}
        busyLabel="Đang đăng nhập…"
        label="Đăng nhập"
        onPress={() => void submit()}
      />
      <AuthLink label="Tạo tài khoản" onPress={onSwitch} />
    </View>
  );
}
