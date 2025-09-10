import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        ¡Bienvenido a Smart Condominium! 🏢
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Unidades Totales"
            percent={0}
            total={48}
            icon={<img alt="Unidades" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
              series: [48, 48, 48, 48, 48, 48],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Usuarios Activos"
            percent={5.2}
            total={42}
            color="secondary"
            icon={<img alt="Usuarios" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
              series: [38, 40, 39, 41, 42, 42],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Cuotas al Día"
            percent={87.5}
            total={42}
            color="success"
            icon={<img alt="Finanzas" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
              series: [35, 38, 40, 39, 41, 42],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Comunicados"
            percent={20}
            total={12}
            color="warning"
            icon={<img alt="Comunicados" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
              series: [8, 9, 10, 11, 11, 12],
            }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
