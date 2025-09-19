import { Navigate } from 'react-router-dom';

import { useAuth } from 'src/context/AuthContext';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
}

export function RoleProtectedRoute({ 
  allowedRoles, 
  children, 
  redirectTo = '/404' 
}: RoleProtectedRouteProps) {
  const { user } = useAuth();

  if (!user?.role_name || !allowedRoles.includes(user.role_name)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}