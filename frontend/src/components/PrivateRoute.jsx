import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Supply Chain System...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to proper role dashboard
    const roleRedirects = {
      manufacturer: '/manufacturer',
      distributor: '/distributor',
      transporter: '/transporter',
      retailer: '/retailer',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
