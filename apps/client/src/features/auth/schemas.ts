import { z } from 'zod';

export function codePointLength(value: string): number {
  return [...value].length;
}

const email = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(1, 'Nhập địa chỉ email.')
      .refine((value) => codePointLength(value) <= 254, 'Email quá dài.')
      .email('Email không hợp lệ.'),
  );

const password = z
  .string()
  .refine(
    (value) => codePointLength(value) >= 15,
    'Mật khẩu phải có ít nhất 15 ký tự Unicode.',
  )
  .refine(
    (value) => codePointLength(value) <= 128,
    'Mật khẩu không được vượt quá 128 ký tự Unicode.',
  );

const displayName = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  })
  .refine(
    (value) => !value || codePointLength(value) <= 80,
    'Tên hiển thị không được vượt quá 80 ký tự.',
  );

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, 'Nhập mật khẩu.')
    .refine(
      (value) => codePointLength(value) <= 128,
      'Mật khẩu không được vượt quá 128 ký tự Unicode.',
    ),
});
export const registerSchema = z.object({ email, displayName, password });

export type LoginValues = z.input<typeof loginSchema>;
export type RegisterValues = z.input<typeof registerSchema>;
