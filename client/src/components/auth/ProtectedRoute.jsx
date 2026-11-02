import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Guards private pages (Dashboard, Give/Take Item, Profile)
 * Redirects unauthenticated users to the Login/Signup portal
 */
export default function ProtectedRoute({ children, fallbackMessage }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-darkbrown/60">प्रमाणीकरण जांच जारी है (Checking authorization)...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to /login preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
