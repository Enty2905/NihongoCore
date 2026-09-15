import { Platform } from 'react-native';
import { z } from 'zod';
import {
  ApiError,
  apiRequest,
  setAccessToken,
} from '../../services/api/client';
import {
  clearRefreshCredential,
  clearLogoutPending,
  readRefreshCredential,
  readLogoutPending,
  writeLogoutPending,
  writeRefreshCredential,
} from './credential-store';
import type { LoginValues, RegisterValues } from './schemas';

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  displayName: z.string().nullable(),
});
const authenticationSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  user: userSchema,
});
const refreshSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});
const emptySchema = z.null();

function platform(): 'web' | 'native' {
  return Platform.OS === 'web' ? 'web' : 'native';
}

function postHeaders(): HeadersInit {
  return {
    'X-Client-Platform': platform(),
    ...(Platform.OS === 'web' ? { 'X-CSRF-Protection': '1' } : {}),
  };
}

async function acceptAuthentication(
  result: z.infer<typeof authenticationSchema>,
): Promise<z.infer<typeof userSchema>> {
  await clearLogoutPending();
  if (Platform.OS !== 'web') {
    if (!result.refreshToken)
      throw new Error('Missing native refresh credential');
    await writeRefreshCredential(result.refreshToken);
  }
  setAccessToken(result.accessToken);
  return result.user;
}

export async function register(values: RegisterValues) {
  const result = await apiRequest('/auth/register', authenticationSchema, {
    method: 'POST',
    headers: postHeaders(),
    body: JSON.stringify(values),
    retryAuthentication: false,
  });
  return acceptAuthentication(result);
}

export async function login(values: LoginValues) {
  const result = await apiRequest('/auth/login', authenticationSchema, {
    method: 'POST',
    headers: postHeaders(),
    body: JSON.stringify(values),
    retryAuthentication: false,
  });
  return acceptAuthentication(result);
}

let refreshPromise: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshPromise ??= performRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function performRefresh(): Promise<boolean> {
  const stored = Platform.OS === 'web' ? null : await readRefreshCredential();
  if (Platform.OS !== 'web' && !stored) {
    setAccessToken(null);
    return false;
  }
  try {
    const result = await apiRequest('/auth/refresh', refreshSchema, {
      method: 'POST',
      headers: postHeaders(),
      body: JSON.stringify(stored ? { refreshToken: stored } : {}),
      retryAuthentication: false,
    });
    if (Platform.OS !== 'web') {
      if (!result.refreshToken) return false;
      await writeRefreshCredential(result.refreshToken);
    }
    setAccessToken(result.accessToken);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      setAccessToken(null);
      await clearRefreshCredential();
      return false;
    }
    throw error;
  }
}

export function getMe() {
  return apiRequest('/auth/me', userSchema, {
    authenticated: true,
    retryAuthentication: true,
  });
}

export async function logout(): Promise<void> {
  const stored = Platform.OS === 'web' ? null : await readRefreshCredential();
  await apiRequest('/auth/logout', emptySchema, {
    method: 'POST',
    headers: postHeaders(),
    body: JSON.stringify(stored ? { refreshToken: stored } : {}),
    retryAuthentication: false,
  });
  setAccessToken(null);
  await clearRefreshCredential();
  await clearLogoutPending();
}

export function markLogoutPending(): Promise<void> {
  return writeLogoutPending();
}

export function hasPendingLogout(): Promise<boolean> {
  return readLogoutPending();
}

export function clearAuthentication(): Promise<void> {
  setAccessToken(null);
  return clearRefreshCredential();
}

export { userSchema };
