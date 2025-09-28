import { useMemo } from 'react';

import { useAuth } from 'src/context/AuthContext';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const icon = (name: string) => <Iconify width={22} icon={name as any} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export function useNavData() {
  const { user } = useAuth();
  
  const navData = useMemo(() => {
    const baseData = [
      { title: 'Dashboard', path: '/', icon: icon('solar:chart-square-bold-duotone') },
      { title: 'Comunicados', path: '/announcements', icon: icon('solar:bell-bold-duotone') },
      { title: 'Reservas', path: '/reservations', icon: icon('solar:calendar-bold-duotone') },
      // Mi Cuenta es visible para todos menos el Guardia
      ...(user?.role_name !== 'Guardia' ? [{ title: 'Mis Cosas', path: '/account', icon: icon('solar:user-bold-duotone') }] : []),
    ];

    if (user?.role_name === 'Administrador') {
      return [
        ...baseData,
        { title: 'Finanzas', path: '/finances', icon: icon('solar:dollar-bold-duotone') },
        { title: 'Usuarios', path: '/users', icon: icon('solar:users-group-two-rounded-bold-duotone') },
        { title: 'Unidades', path: '/units', icon: icon('solar:home-bold-duotone') },
        { title: 'Áreas Comunes', path: '/common-areas', icon: icon('solar:buildings-bold-duotone') },
        { title: 'Registro de Visitas', path: '/visitor-log', icon: icon('solar:users-group-rounded-bold-duotone') },
        { title: 'Tareas', path: '/tasks', icon: icon('solar:checklist-bold-duotone') },
        { title: 'Feedback', path: '/feedback', icon: icon('solar:chat-round-dots-bold-duotone') },
      ];
    }

    if (user?.role_name === 'Residente') {
      return [
        ...baseData,
        { title: 'Finanzas', path: '/finances', icon: icon('solar:dollar-bold-duotone') },
        // Los residentes no ven el feedback global, lo envían desde "Mi Cuenta"
      ];
    }

    if (user?.role_name === 'Guardia') {
      return [
        ...baseData,
        { title: 'Registro de Visitas', path: '/visitor-log', icon: icon('solar:users-group-rounded-bold-duotone') },
        { title: 'Tareas', path: '/tasks', icon: icon('solar:checklist-bold-duotone') },
      ];
    }

    return baseData; // Fallback por si el rol no existe
  }, [user]);

  return navData;
}
