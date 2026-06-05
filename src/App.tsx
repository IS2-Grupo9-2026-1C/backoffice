import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/Login';
import Users from '@/pages/Users';
import Items from '@/pages/Items';
import Orders from '@/pages/Orders';
import Metrics from '@/pages/Metrics';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/users" element={<Users />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/items" element={<Items />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
