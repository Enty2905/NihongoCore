import { z } from 'zod';

const apiUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  });

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
): Promise<T> {
  const configuredUrl = apiUrlSchema.safeParse(process.env.EXPO_PUBLIC_API_URL);
  if (!configuredUrl.success) {
    throw new ApiError(
      'API_NOT_CONFIGURED',
      'Set EXPO_PUBLIC_API_URL in apps/client/.env.',
    );
  }
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  // RequestInit allows future callers to supply auth headers; M1 stores no tokens.
  let response: Response;
  try {
    response = await fetch(configuredUrl.data.replace(/\/$/, '') + path, {
      ...options,
      headers,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(
      'NETWORK_ERROR',
      'Cannot reach the API. Check the server and network.',
    );
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = z
      .object({ code: z.string(), message: z.string() })
      .safeParse(body);
    throw new ApiError(
      parsed.success ? parsed.data.code : 'HTTP_ERROR',
      parsed.success ? parsed.data.message : 'The API request failed.',
      response.status,
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new ApiError(
      'INVALID_RESPONSE',
      'The API returned an unexpected response.',
    );
  return parsed.data;
}
