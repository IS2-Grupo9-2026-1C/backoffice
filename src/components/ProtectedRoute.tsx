import { Navigate, Outlet } from 'react-router-dom';
import { AUTH_CHANGE_EVENT, getToken } from '@/storage/token';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    const syncToken = () => {
      getToken().then((next) => {
        if (active) setToken(next);
      });
    };

    const handleAuthChange = () => {
      syncToken();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'admin_access_token') {
        syncToken();
      }
    };

    syncToken();
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (token === undefined) return null;
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
