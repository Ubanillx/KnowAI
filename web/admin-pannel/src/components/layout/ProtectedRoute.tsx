import React from 'react'; // 确保导入了 React 
import { Navigate } from 'react-router-dom';

// 使用 React.ReactNode 替代 JSX.Element，它能包含组件、字符串、null 等所有合法 React 节点
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('know_ai_token') || sessionStorage.getItem('know_ai_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // 使用 Fragment 包裹以确保类型兼容
};

export default ProtectedRoute;