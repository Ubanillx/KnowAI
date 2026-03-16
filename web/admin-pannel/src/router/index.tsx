// src/router/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/Auth';
import DashboardLayout from '../components/layout/DashboardLayout'; 
import Overview from '../pages/Dashboard/index'; // ✨ 修改了这里：指向刚才填入代码的 index.tsx
import UserManagement from '../pages/Dashboard/UserManagement';
import Settings from '../pages/Dashboard/Settings';
import ProtectedRoute from '../components/layout/ProtectedRoute';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} /> 
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};