import * as SecureStore from 'expo-secure-store';

const key = 'nihongocore.refresh-token';
const logoutPendingKey = 'nihongocore.logout-pending';

export function readRefreshCredential(): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export function writeRefreshCredential(value: string): Promise<void> {
  return SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export function clearRefreshCredential(): Promise<void> {
  return SecureStore.deleteItemAsync(key);
}

export async function readLogoutPending(): Promise<boolean> {
  return (await SecureStore.getItemAsync(logoutPendingKey)) === '1';
}

export function writeLogoutPending(): Promise<void> {
  return SecureStore.setItemAsync(logoutPendingKey, '1', {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export function clearLogoutPending(): Promise<void> {
  return SecureStore.deleteItemAsync(logoutPendingKey);
}
