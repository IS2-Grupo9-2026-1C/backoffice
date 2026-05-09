import { ApiError, request } from './api';
import { decodeJwt } from './jwt';
import {
  getRefreshToken,
  getToken,
  removeRefreshToken,
  removeToken,
  saveRefreshToken,
  saveToken,
} from '@/storage/token';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

async function saveTokens(tokens: TokenResponse): Promise<void> {
  await saveToken(tokens.access_token);
  await saveRefreshToken(tokens.refresh_token);
}

async function clearTokens(): Promise<void> {
  await removeToken();
  await removeRefreshToken();
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const data = await request<TokenResponse>('/auth/admin/token', {
    method: 'POST',
    body: { username: email, password },
    contentType: 'form',
  });
  const claims = decodeJwt(data.access_token);
  if (claims?.role !== 'admin') {
    throw new ApiError(403, 'Acceso denegado: se requiere rol admin');
  }
  await saveTokens(data);
  return data;
}

export async function refreshToken(): Promise<string> {
  const refreshTokenValue = await getRefreshToken();
  if (!refreshTokenValue) {
    await clearTokens();
    throw new ApiError(401, 'Unauthorized');
  }

  let data: TokenResponse;
  try {
    data = await request<TokenResponse>('/auth/admin/token/refresh', {
      method: 'POST',
      body: { refresh_token: refreshTokenValue },
    });
  } catch (error) {
    await clearTokens();
    throw error;
  }

  await saveTokens(data);
  return data.access_token;
}

export async function requestWithAuth<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    headers?: Record<string, string>;
    contentType?: 'json' | 'form';
  } = {},
): Promise<T> {
  const token = await getToken();
  if (!token) {
    await clearTokens();
    throw new ApiError(401, 'Unauthorized');
  }

  try {
    return await request<T>(endpoint, { ...options, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const refreshedToken = await refreshToken();
      return request<T>(endpoint, { ...options, token: refreshedToken });
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await clearTokens();
}
