// external imports
import { useEffect } from 'react';

// material-ui imports
import { Box, CircularProgress } from '@mui/material';

// internal imports
import { useAuth } from '../context/AuthContext';

// ----------------------------------------------------------------------

function SplashScreen() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthLoader({ children }: Props) {
  const { initialize, isInitialized } = useAuth();

  useEffect(() => {
    console.log('%c[DEBUG] AuthLoader mounted, starting initialization...', 'color: #2196F3; font-weight: bold');
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isInitialized) {
    console.log('%c[DEBUG] Waiting for initialization...', 'color: #FFA500');
    return <SplashScreen />;
  }

  console.log('%c[DEBUG] Initialization complete, rendering app', 'color: #4CAF50; font-weight: bold');
  return <>{children}</>;
}
