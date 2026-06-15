import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AUTH_CHANGE_EVENT, isAuthenticated } from '@/storage/token';
import { initAuth } from '@/services/auth';

type AuthStatus = 'checking' | 'authed' | 'anon';

export default function ProtectedRoute() {
  const [status, setStatus] = useState<AuthStatus>(() =>
    isAuthenticated() ? 'authed' : 'checking',
  );

  useEffect(() => {
    let active = true;

    if (isAuthenticated()) {
      setStatus('authed');
    } else {
      initAuth().then((ok) => {
        if (active) setStatus(ok ? 'authed' : 'anon');
      });
    }

    const handleAuthChange = () => {
      if (active) setStatus(isAuthenticated() ? 'authed' : 'anon');
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  if (status === 'checking') return null;
  if (status === 'anon') return <Navigate to="/login" replace />;
  return <Outlet />;
}
