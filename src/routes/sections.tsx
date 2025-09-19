import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

// layout imports
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// local imports
import ProtectedRoute from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const AnnouncementsPage = lazy(() => import('src/pages/announcements'));
export const CommonAreasPage = lazy(() => import('src/pages/common-areas'));
export const FinancesPage = lazy(() => import('src/pages/finances'));
export const ReservationsPage = lazy(() => import('src/pages/reservations'));
export const VisitorLogPage = lazy(() => import('src/pages/visitor-log'));
export const AccountPage = lazy(() => import('src/pages/account'));
export const UsersPage = lazy(() => import('src/pages/users'));
export const UnitsPage = lazy(() => import('src/pages/units'));
export const TasksPage = lazy(() => import('src/pages/tasks'));
export const FeedbackPage = lazy(() => import('src/pages/feedback'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <DashboardLayout>
            <Suspense fallback={renderFallback()}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'announcements', element: <AnnouncementsPage /> },
          { path: 'common-areas', element: <CommonAreasPage /> },
          { 
            path: 'finances', 
            element: (
              <RoleProtectedRoute allowedRoles={['Administrador', 'Residente']}>
                <FinancesPage />
              </RoleProtectedRoute>
            ) 
          },
          { path: 'reservations', element: <ReservationsPage /> },
          { 
            path: 'visitor-log', 
            element: (
              <RoleProtectedRoute allowedRoles={['Administrador', 'Guardia']}>
                <VisitorLogPage />
              </RoleProtectedRoute>
            ) 
          },
          { path: 'account', element: <AccountPage /> },
          { 
            path: 'users', 
            element: (
              <RoleProtectedRoute allowedRoles={['Administrador']}>
                <UsersPage />
              </RoleProtectedRoute>
            ) 
          },
          { 
            path: 'units', 
            element: (
              <RoleProtectedRoute allowedRoles={['Administrador']}>
                <UnitsPage />
              </RoleProtectedRoute>
            ) 
          },
          { path: 'tasks', element: <TasksPage /> },
          { 
            path: 'feedback', 
            element: (
              <RoleProtectedRoute allowedRoles={['Administrador']}>
                <FeedbackPage />
              </RoleProtectedRoute>
            ) 
          },
        ],
      },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
