import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/Login';
import Users from '@/pages/Users';
import Items from '@/pages/Items';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/users" element={<Users />} />
          <Route path="/items" element={<Items />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
