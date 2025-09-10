import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Comunicados',
    path: '/announcements',
    icon: icon('ic-blog'),
  },
  {
    title: 'Finanzas',
    path: '/finances',
    icon: icon('ic-cart'),
  },
  {
    title: 'Usuarios',
    path: '/users',
    icon: icon('ic-user'),
  },
  {
    title: 'Unidades',
    path: '/units',
    icon: icon('ic-analytics'),
  },
];
