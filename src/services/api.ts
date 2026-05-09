import config from '@/config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
  contentType?: 'json' | 'form';
}

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
  const { method = 'GET', body, token, headers: extraHeaders, contentType = 'json' } = options;

  const headers: Record<string, string> = { ...(extraHeaders ?? {}) };

  if (body) {
    headers['Content-Type'] =
      contentType === 'form' ? 'application/x-www-form-urlencoded' : 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let encodedBody: string | undefined;
  if (body && contentType === 'form') {
    encodedBody = new URLSearchParams(body as Record<string, string>).toString();
  } else if (body) {
    encodedBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}${endpoint}`, {
      method,
      headers,
      body: encodedBody,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      error instanceof TypeError ? `Network error: ${error.message}` : 'Unknown network error',
    );
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
