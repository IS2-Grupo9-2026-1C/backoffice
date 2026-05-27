const ACCESS_TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
export const AUTH_CHANGE_EVENT = 'auth:changed';

function emitAuthChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export async function getToken(): Promise<string | null> {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  emitAuthChange();
}

export async function removeToken(): Promise<void> {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  emitAuthChange();
}

export async function getRefreshToken(): Promise<string | null> {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function saveRefreshToken(token: string): Promise<void> {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
  emitAuthChange();
}

export async function removeRefreshToken(): Promise<void> {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  emitAuthChange();
}
