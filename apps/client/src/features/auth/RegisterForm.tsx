import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, View } from 'react-native';
import { ApiError } from '../../services/api/client';
import {
  AuthButton,
  AuthField,
  AuthLink,
  FormMessage,
  authControlStyles,
} from './AuthControls';
import { registerSchema, type RegisterValues } from './schemas';

interface Props {
  onSubmit(values: RegisterValues): Promise<void>;
  onSwitch(): void;
}

export function RegisterForm({ onSubmit, onSwitch }: Props) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', displayName: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    setDuplicate(false);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'EMAIL_ALREADY_EXISTS') {
          setDuplicate(true);
          setServerError('Email này đã được sử dụng.');
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError('Không thể tạo tài khoản. Vui lòng thử lại.');
      }
    }
  });

  return (
    <View style={authControlStyles.form}>
      {serverError ? <FormMessage>{serverError}</FormMessage> : null}
      {duplicate ? (
        <AuthLink label="Đăng nhập để tiếp tục" onPress={onSwitch} />
      ) : null}
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
        name="displayName"
        render={({ field, fieldState }) => (
          <AuthField
            autoComplete="name"
            error={fieldState.error?.message}
            label="Tên hiển thị"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            optionalLabel="(Tuỳ chọn)"
            placeholder="Tên hiển thị"
            returnKeyType="next"
            value={field.value}
          />
        )}
      />
      <Text style={authControlStyles.helper}>
        Tối đa 80 ký tự. Có thể để trống.
      </Text>
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <AuthField
            autoComplete="new-password"
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
      <Text style={authControlStyles.helper}>
        15–128 ký tự Unicode. Cho phép khoảng trắng; không bắt buộc chữ hoa, số
        hay ký hiệu.
      </Text>
      <AuthButton
        busy={isSubmitting}
        busyLabel="Đang tạo tài khoản…"
        label="Tạo tài khoản"
        onPress={() => void submit()}
      />
      <AuthLink label="Đăng nhập" onPress={onSwitch} />
    </View>
  );
}
