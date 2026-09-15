export async function readRefreshCredential(): Promise<string | null> {
  return null;
}

export async function writeRefreshCredential(_value: string): Promise<void> {}

export async function clearRefreshCredential(): Promise<void> {}

const logoutPendingKey = 'nihongocore.logout-pending';

export async function readLogoutPending(): Promise<boolean> {
  return (
    typeof localStorage !== 'undefined' &&
    localStorage.getItem(logoutPendingKey) === '1'
  );
}

export async function writeLogoutPending(): Promise<void> {
  localStorage.setItem(logoutPendingKey, '1');
}

export async function clearLogoutPending(): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(logoutPendingKey);
  }
}
