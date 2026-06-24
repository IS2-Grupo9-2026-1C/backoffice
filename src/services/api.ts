import config from '@/config';
import { getCsrfToken } from '@/storage/token';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const DEFAULT_TIMEOUT_MS = 15000;

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  contentType?: 'json' | 'form';
  timeoutMs?: number;
}

const CSRF_BOOTSTRAP_PLACEHOLDER = 'bootstrap';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers: extraHeaders,
    contentType = 'json',
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const headers: Record<string, string> = { ...(extraHeaders ?? {}) };

  if (body) {
    headers['Content-Type'] =
      contentType === 'form' ? 'application/x-www-form-urlencoded' : 'application/json';
  }

  headers['X-CSRF-Token'] = getCsrfToken() ?? CSRF_BOOTSTRAP_PLACEHOLDER;

  let encodedBody: string | undefined;
  if (body && contentType === 'form') {
    encodedBody = new URLSearchParams(body as Record<string, string>).toString();
  } else if (body) {
    encodedBody = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}${endpoint}`, {
      method,
      headers,
      body: encodedBody,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
      throw new ApiError(504, 'La conexión tardó demasiado. Intentá de nuevo.');
    }
    throw new ApiError(
      0,
      error instanceof TypeError ? `Network error: ${error.message}` : 'Unknown network error',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.detail ?? JSON.stringify(errorBody);
    } catch {
      errorMessage = response.statusText || `HTTP error ${response.status}`;
    }
    throw new ApiError(response.status, errorMessage);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export interface BlobResponse {
  blob: Blob;
  filename: string | null;
}

export async function requestBlob(endpoint: string): Promise<BlobResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${config.apiUrl}${endpoint}`, {
      headers: {
        'X-CSRF-Token': getCsrfToken() ?? CSRF_BOOTSTRAP_PLACEHOLDER,
      },
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError(504, 'La conexión tardó demasiado. Intentá de nuevo.');
    }
    throw new ApiError(
      0,
      error instanceof TypeError ? `Network error: ${error.message}` : 'Unknown network error',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let errorMessage = response.statusText || `HTTP error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.detail ?? JSON.stringify(errorBody);
    } catch {
      // Keep the HTTP status text when the body is not JSON.
    }
    throw new ApiError(response.status, errorMessage);
  }

  const disposition = response.headers.get('Content-Disposition');
  const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? null;
  return { blob: await response.blob(), filename };
}
