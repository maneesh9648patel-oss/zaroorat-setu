import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

/**
 * ProtectedRoute Component
 * Guards private pages (Dashboard, Give/Take Item, Profile, Verifier Panel)
 * 1. Unauthenticated users -> Redirected to /login (preserving destination state)
 * 2. Unauthorized roles (e.g. non-verifier trying to open /verifier) -> Blocked & redirected to /
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-darkbrown/60">प्रमाणीकरण जांच जारी है (Checking authorization)...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based protection: Check if current user role is allowed
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || 'needer').toLowerCase();
    const hasPermission = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

    if (!hasPermission) {
      console.warn(`[RouteGuard] Access denied for role "${userRole}" at ${location.pathname}`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
