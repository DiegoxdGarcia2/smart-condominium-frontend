import axios from 'axios';
import React, { useState, useEffect } from 'react';

import { Grid, Card, Typography, CardContent } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsWidgetSummary } from './analytics-widget-summary';
import { AnalyticsWebsiteVisits } from './analytics-website-visits';

const AdminDashboard = () => {
  // Ajustar las propiedades del componente <Grid> y definir tipos explícitos para los datos
  const [data, setData] = useState({
    monthlyIncome: 0,
    pendingFees: 0,
    activeUsers: 0,
    todayReservations: 0,
    financialData: [{ name: 'Ingresos', data: [10, 20, 30] }],
    feedback: [{ message: 'Buen servicio' }],
    pendingTasks: [{ name: 'Revisar facturas' }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [financialFees, users, reservations, feedback] = await Promise.all([
          axios.get('/api/administration/financial-fees/'),
          axios.get('/api/administration/users/'),
          axios.get('/api/administration/reservations/'),
          axios.get('/api/administration/feedback/')
        ]);

        setData({
          monthlyIncome: 15000,
          pendingFees: 2500,
          activeUsers: 42,
          todayReservations: 8,
          feedback: [{ message: 'Excelente servicio de mantenimiento' }, { message: 'Las áreas comunes están muy limpias' }, { message: 'Buena respuesta a quejas' }],
          financialData: [{ name: 'Ingresos', data: [12000, 13500, 14200, 15800, 16500, 15000] }],
          pendingTasks: [{ name: 'Revisar facturas de servicios' }, { name: 'Actualizar lista de proveedores' }]
        });
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Dashboard del Administrador
      </Typography>
      <Grid container spacing={3}>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary 
            title="Ingresos del Mes" 
            total={data.monthlyIncome} 
            percent={10} 
            chart={{ series: [1, 2], categories: ['A', 'B'] }} 
            icon={<img alt="Ingresos" src="/assets/icons/glass/ic-glass-buy.svg" />} 
          />
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary 
            title="Cuotas Pendientes" 
            total={data.pendingFees} 
            percent={20} 
            chart={{ series: [3, 4], categories: ['C', 'D'] }} 
            icon={<img alt="Cuotas" src="/assets/icons/glass/ic-glass-bag.svg" />} 
          />
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary 
            title="Usuarios Activos" 
            total={data.activeUsers} 
            percent={30} 
            chart={{ series: [5, 6], categories: ['E', 'F'] }} 
            icon={<img alt="Usuarios" src="/assets/icons/glass/ic-glass-users.svg" />} 
          />
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary 
            title="Reservas para Hoy" 
            total={data.todayReservations} 
            percent={40} 
            chart={{ series: [7, 8], categories: ['G', 'H'] }} 
            icon={<img alt="Reservas" src="/assets/icons/glass/ic-glass-message.svg" />} 
          />
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12}>
          <AnalyticsWebsiteVisits 
            title="Ingresos de los Últimos 6 Meses" 
            chart={{ 
              series: [{ name: 'Ingresos', data: [10, 20, 30] }], 
              categories: ['Enero', 'Febrero', 'Marzo'] 
            }} 
          />
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Feedback Reciente</Typography>
              {Array.isArray(data.feedback) && data.feedback.slice(0, 3).map((item, index) => (
                <Typography key={index}>{item.message}</Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
        {/* @ts-expect-error: Grid sizing props not compatible with current MUI version */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tareas Pendientes</Typography>
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

export default AdminDashboard;