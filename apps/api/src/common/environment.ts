import { z } from 'zod';

const origin = z
  .string()
  .url()
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return (
        ['http:', 'https:'].includes(parsed.protocol) && parsed.origin === value
      );
    } catch {
      return false;
    }
  });

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  API_HOST: z.string().min(1).default('0.0.0.0'),
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => /^postgres(ql)?:\/\//.test(value)),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .pipe(z.array(origin)),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(60)
    .max(86_400)
    .default(900),
  AUTH_REFRESH_IDLE_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(300)
    .default(604_800),
  AUTH_SESSION_ABSOLUTE_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(300)
    .default(2_592_000),
  AUTH_JWT_ISSUER: z.string().min(1).default('nihongocore-api'),
  AUTH_JWT_AUDIENCE: z.string().min(1).default('nihongocore-client'),
  AUTH_REFRESH_COOKIE_NAME: z
    .string()
    .regex(/^[A-Za-z0-9_-]+$/)
    .default('nihongocore_refresh'),
  AUTH_ARGON2_MEMORY_KIB: z.coerce.number().int().min(8_192).default(19_456),
  AUTH_ARGON2_TIME_COST: z.coerce.number().int().min(1).default(2),
  AUTH_ARGON2_PARALLELISM: z.coerce.number().int().min(1).default(1),
  AUTH_THROTTLE_TTL_MS: z.coerce.number().int().min(1_000).default(60_000),
  AUTH_THROTTLE_LIMIT: z.coerce.number().int().min(1).default(10),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  const result = environmentSchema.safeParse(input);
  if (!result.success) {
    // Report field names only: configuration can contain credentials.
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path[0])),
    ];
    throw new Error('Invalid environment configuration: ' + fields.join(', '));
  }
  if (
    result.data.AUTH_REFRESH_IDLE_TTL_SECONDS >
    result.data.AUTH_SESSION_ABSOLUTE_TTL_SECONDS
  ) {
    throw new Error(
      'Invalid environment configuration: AUTH_REFRESH_IDLE_TTL_SECONDS',
    );
  }
  return result.data;
}
