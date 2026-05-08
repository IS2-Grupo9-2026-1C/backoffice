import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '@/storage/token';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getToken().then(setToken);
  }, []);

  if (token === undefined) return null;
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
