import { Navigate, Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from '../context/AuthContext';

// Componente de carga
const LoadingSpinner = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

// Wrapper de ruta privada
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras se verifica la sesión, mostrar loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Una vez verificada la sesión, decidir si mostrar contenido o redirigir
  return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export default ProtectedRoute;
