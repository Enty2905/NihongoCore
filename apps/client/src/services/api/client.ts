import { Platform } from 'react-native';
import { z } from 'zod';

const apiUrlSchema = z
  .string()
  .url()
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol));

const errorSchema = z.object({
  statusCode: z.number().optional(),
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
    public readonly details: unknown = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
  retryAuthentication?: boolean;
}

let accessToken: string | null = null;
let refreshHandler: (() => Promise<boolean>) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function registerRefreshHandler(
  handler: (() => Promise<boolean>) | null,
): void {
  refreshHandler = handler;
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ApiRequestOptions = {},
): Promise<T> {
  const configuredUrl = apiUrlSchema.safeParse(process.env.EXPO_PUBLIC_API_URL);
  if (!configuredUrl.success) {
    throw new ApiError(
      'API_NOT_CONFIGURED',
      'Set EXPO_PUBLIC_API_URL in apps/client/.env.',
    );
  }

  const execute = async (): Promise<Response> => {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (options.authenticated && accessToken) {
      headers.set('Authorization', 'Bearer ' + accessToken);
    }
    try {
      return await fetch(configuredUrl.data.replace(/\/$/, '') + path, {
        ...options,
        headers,
        credentials: Platform.OS === 'web' ? 'include' : options.credentials,
      });
    } catch (error) {
      if (options.signal?.aborted) throw error;
      throw new ApiError(
        'NETWORK_ERROR',
        'Không thể kết nối. Vui lòng thử lại.',
      );
    }
  };

  let response = await execute();
  if (
    response.status === 401 &&
    options.authenticated &&
    options.retryAuthentication !== false &&
    refreshHandler &&
    (await refreshHandler())
  ) {
    response = await execute();
  }

  const body: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = errorSchema.safeParse(body);
    throw new ApiError(
      parsed.success ? parsed.data.code : 'HTTP_ERROR',
      parsed.success ? parsed.data.message : 'Yêu cầu API không thành công.',
      response.status,
      parsed.success ? parsed.data.details : {},
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(
      'INVALID_RESPONSE',
      'API trả về dữ liệu không đúng định dạng.',
    );
  }
  return parsed.data;
}
