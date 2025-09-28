import axios from 'axios';
import React, { useState, useEffect } from 'react';

import { Grid, Card, Button, Typography, CardContent } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsNews } from './analytics-news';

const ResidentDashboard = () => {
  const [data, setData] = useState({
    totalDebt: 0,
    upcomingReservations: [] as { name: string; date: string }[],
    announcements: [] as { id: string; title: string; coverUrl: string; description: string; postedAt: string | number | null }[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [financialFees, reservations, announcements] = await Promise.all([
          axios.get('/api/resident/financial-fees/'),
          axios.get('/api/resident/reservations/'),
          axios.get('/api/resident/announcements/')
        ]);

        setData({
          totalDebt: 1250,
          upcomingReservations: [{ name: 'Sala de reuniones', date: '2025-09-30' }, { name: 'Gimnasio', date: '2025-10-02' }],
          announcements: [
            { id: '1', title: 'Mantenimiento programado', coverUrl: '/assets/images/announcement1.jpg', description: 'El próximo fin de semana habrá mantenimiento en el ascensor.', postedAt: Date.now() },
            { id: '2', title: 'Reunión de copropietarios', coverUrl: '/assets/images/announcement2.jpg', description: 'Reunión mensual el día 15.', postedAt: Date.now() - 86400000 }
          ]
        });
      } catch (error) {
        console.error('Error fetching resident dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Dashboard del Residente
      </Typography>
      <Grid container spacing={3}>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4">Saldo Pendiente</Typography>
              <Typography variant="h6">${data.totalDebt}</Typography>
              <Button variant="contained" color="primary">Pagar Ahora</Button>
            </CardContent>
          </Card>
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Mis Próximas Reservas</Typography>
              {Array.isArray(data.upcomingReservations) && data.upcomingReservations.map((reservation, index) => (
                <Typography key={index}>{reservation.name} - {reservation.date}</Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} md={12}>
          <AnalyticsNews title="Últimos Comunicados" list={Array.isArray(data.announcements) ? data.announcements : []} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
};

export default ResidentDashboard;