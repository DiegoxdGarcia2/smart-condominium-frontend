// external imports
import { Outlet, Navigate } from 'react-router-dom';

// internal imports
import { useAuth } from '../context/AuthContext';

// ----------------------------------------------------------------------

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  console.log('%c[DEBUG] ProtectedRoute check:', 'color: #9C27B0', { isAuthenticated });

  // Ya no necesitamos verificar isInitialized aquí porque AuthLoader ya se encargó
  if (!isAuthenticated) {
    console.log('%c[DEBUG] Not authenticated, redirecting to login', 'color: #f44336');
    return <Navigate to="/sign-in" replace />;
  }

  console.log('%c[DEBUG] Authenticated, rendering protected content', 'color: #4CAF50');
  return <Outlet />;
}
