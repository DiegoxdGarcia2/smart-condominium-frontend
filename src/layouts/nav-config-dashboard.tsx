import { useMemo } from 'react';

import { useAuth } from 'src/context/AuthContext';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

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
      { title: 'Dashboard', path: '/', icon: icon('ic-analytics') },
      { title: 'Comunicados', path: '/announcements', icon: icon('ic-blog') },
      { title: 'Reservas', path: '/reservations', icon: icon('ic-blog') },
      // Mi Cuenta es visible para todos menos el Guardia
      ...(user?.role_name !== 'Guardia' ? [{ title: 'Mi Cuenta', path: '/account', icon: icon('ic-user') }] : []),
    ];

    if (user?.role_name === 'Administrador') {
      return [
        ...baseData,
        { title: 'Finanzas', path: '/finances', icon: icon('ic-cart') },
        { title: 'Usuarios', path: '/users', icon: icon('ic-user') },
        { title: 'Unidades', path: '/units', icon: icon('ic-analytics') },
        { title: 'Áreas Comunes', path: '/common-areas', icon: icon('ic-analytics') },
        { title: 'Registro de Visitas', path: '/visitor-log', icon: icon('ic-book') },
        { title: 'Tareas', path: '/tasks', icon: icon('ic-blog') },
        { title: 'Feedback', path: '/feedback', icon: icon('ic-blog') },
      ];
    }

    if (user?.role_name === 'Residente') {
      return [
        ...baseData,
        { title: 'Finanzas', path: '/finances', icon: icon('ic-cart') },
        // Los residentes no ven el feedback global, lo envían desde "Mi Cuenta"
      ];
    }

    if (user?.role_name === 'Guardia') {
      return [
        ...baseData,
        { title: 'Registro de Visitas', path: '/visitor-log', icon: icon('ic-book') },
        { title: 'Tareas', path: '/tasks', icon: icon('ic-blog') },
      ];
    }

    return baseData; // Fallback por si el rol no existe
  }, [user]);

  return navData;
}
