import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessAdmin, hasPermission } from '../../utils/roles';

const ProtectedRoute = ({ adminOnly = false, permission = null }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  if (adminOnly && !canAccessAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
