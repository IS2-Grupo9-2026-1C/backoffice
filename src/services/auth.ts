import { ApiError, request } from './api';
import { clearSession, setSession } from '@/storage/token';

interface AdminAuthResponse {
  token_type: string;
  role: string;
  csrf_token: string;
}

let refreshPromise: Promise<void> | null = null;

export async function login(email: string, password: string): Promise<void> {
  const data = await request<AdminAuthResponse>('/auth/admin/token', {
    method: 'POST',
    body: { username: email, password },
    contentType: 'form',
  });

  if (data.role !== 'admin') {
    clearSession();
    throw new ApiError(403, 'Acceso denegado: se requiere rol admin');
  }

  // Tokens are now httpOnly cookies; we only keep the CSRF token in memory.
  setSession(data.csrf_token);
}

export async function refreshSession(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    let data: AdminAuthResponse;
    try {
      // No body: the refresh credential travels in the httpOnly cookie.
      data = await request<AdminAuthResponse>('/auth/admin/token/refresh', {
        method: 'POST',
      });
    } catch (error) {
      clearSession();
      if (error instanceof ApiError) {
        throw new ApiError(401, 'Unauthorized');
      }
      throw error;
    }

    setSession(data.csrf_token);
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
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
  try {
    return await request<T>(endpoint, options);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      // Access cookie expired or CSRF token stale: refresh (rotates cookies + CSRF) and retry once.
      await refreshSession();
      return request<T>(endpoint, options);
    }
    throw error;
  }
}

/**
 * Rebuild the session on app start / page reload from the httpOnly refresh cookie.
 * Returns true when a valid session was restored.
 */
export async function initAuth(): Promise<boolean> {
  try {
    await refreshSession();
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch {
    // Revoke best-effort; clear local state regardless of network/server outcome.
  }
  clearSession();
}
