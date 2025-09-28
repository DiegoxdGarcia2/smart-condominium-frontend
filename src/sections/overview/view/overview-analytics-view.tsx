import Typography from '@mui/material/Typography';

import { useAuth } from 'src/context/AuthContext';
import { DashboardContent } from 'src/layouts/dashboard';

import AdminDashboard from '../admin-dashboard';
import GuardDashboard from '../guard-dashboard';
import ResidentDashboard from '../resident-dashboard';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>; // O SplashScreen si existe
  }

  switch (user.role_name) {
    case 'Administrador':
      return <AdminDashboard />;
    case 'Residente':
      return <ResidentDashboard />;
    case 'Guardia':
      return <GuardDashboard />;
    default:
      return (
        <DashboardContent maxWidth="xl">
          <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
            Rol no reconocido
          </Typography>
        </DashboardContent>
      );
  }
}
