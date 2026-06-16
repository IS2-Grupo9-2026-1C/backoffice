// The access and refresh tokens live in httpOnly cookies the browser manages; }
// here we only keep the in-memory CSRF token (for the double-submit pattern) and the authenticated flag.
// Reloading the tab clears this state and the session is rebuilt via a silent refresh.

export const AUTH_CHANGE_EVENT = 'auth:changed';

let csrfToken: string | null = null;
let authenticated = false;

function emitAuthChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function isAuthenticated(): boolean {
  return authenticated;
}

export function setSession(csrf: string): void {
  csrfToken = csrf;
  authenticated = true;
  emitAuthChange();
}

export function clearSession(): void {
  csrfToken = null;
  authenticated = false;
  emitAuthChange();
}
