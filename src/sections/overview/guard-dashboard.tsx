import axios from 'axios';
import React, { useState, useEffect } from 'react';

import { Grid, Card, Typography, CardContent } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsWidgetSummary } from './analytics-widget-summary';

const GuardDashboard = () => {
  const [data, setData] = useState({
    currentVisitors: 0,
    todayReservations: 0,
    pendingTasks: [] as { name: string }[],
    recentVisitors: [] as { name: string; time: string }[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitorLogs, reservations, tasks] = await Promise.all([
          axios.get('/api/guard/visitor-logs/'),
          axios.get('/api/guard/reservations/'),
          axios.get('/api/guard/tasks/')
        ]);

        setData({
          currentVisitors: 5,
          todayReservations: 3,
          pendingTasks: [{ name: 'Revisar entrada principal' }, { name: 'Verificar cámaras de seguridad' }],
          recentVisitors: [{ name: 'Juan Pérez', time: '10:00 AM' }, { name: 'María López', time: '11:30 AM' }, { name: 'Carlos García', time: '2:15 PM' }]
        });
      } catch (error) {
        console.error('Error fetching guard dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Dashboard del Guardia
      </Typography>
      <Grid container spacing={3}>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
          <AnalyticsWidgetSummary 
            title="Visitantes Actuales" 
            total={data.currentVisitors} 
            percent={0} 
            chart={{ series: [data.currentVisitors], categories: ['Hoy'] }} 
            icon={<img alt="Visitantes" src="/assets/icons/glass/ic-glass-users.svg" />} 
          />
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
          <AnalyticsWidgetSummary 
            title="Reservas de Hoy" 
            total={data.todayReservations} 
            percent={0} 
            chart={{ series: [data.todayReservations], categories: ['Hoy'] }} 
            icon={<img alt="Reservas" src="/assets/icons/glass/ic-glass-bag.svg" />} 
          />
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
          <AnalyticsWidgetSummary 
            title="Mis Tareas Pendientes" 
            total={data.pendingTasks.length} 
            percent={0} 
            chart={{ series: [data.pendingTasks.length], categories: ['Hoy'] }} 
            icon={<img alt="Tareas" src="/assets/icons/glass/ic-glass-message.svg" />} 
          />
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sx={{ display: 'flex' }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Registro de Entradas Recientes</Typography>
              {Array.isArray(data.recentVisitors) && data.recentVisitors.slice(0, 5).map((visitor, index) => (
                <Typography key={index}>{visitor.name} - {visitor.time}</Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sx={{ display: 'flex' }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Mis Tareas Asignadas</Typography>
              {Array.isArray(data.pendingTasks) && data.pendingTasks.map((task, index) => (
                <Typography key={index}>{task.name}</Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
};

export default GuardDashboard;