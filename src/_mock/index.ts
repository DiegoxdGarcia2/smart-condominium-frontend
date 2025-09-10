// ----------------------------------------------------------------------
// Mock data for Smart Condominium

export const _myAccount = {
  displayName: 'Usuario Smart',
  email: 'usuario@smartcondominium.com',
  photoURL: '/assets/images/avatar/avatar-25.webp',
};

export const _langs = [
  {
    value: 'es',
    label: 'Español',
    icon: '/assets/icons/flags/ic-flag-es.svg',
  },
  {
    value: 'en',
    label: 'English',
    icon: '/assets/icons/flags/ic-flag-en.svg',
  },
];

export const _notifications = [
  {
    id: '1',
    title: 'Nuevo comunicado disponible',
    description: 'Se ha publicado un nuevo comunicado para todos los residentes',
    avatarUrl: null,
    type: 'info',
    postedAt: new Date(),
    isUnRead: true,
  },
  {
    id: '2',
    title: 'Cuota mensual vencida',
    description: 'Recordatorio: Su cuota mensual está próxima a vencer',
    avatarUrl: null,
    type: 'warning',
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isUnRead: false,
  },
];

// Datos vacíos para compatibilidad
export const _posts: any[] = [];
export const _tasks: any[] = [];
export const _traffic: any[] = [];
export const _timeline: any[] = [];
