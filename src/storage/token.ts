const ACCESS_TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

export async function getToken(): Promise<string | null> {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function saveRefreshToken(token: string): Promise<void> {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export async function removeRefreshToken(): Promise<void> {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
