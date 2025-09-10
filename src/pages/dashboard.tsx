import { CONFIG } from 'src/config-global';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Smart Condominium - Sistema de gestión inteligente para condominios y comunidades residenciales"
      />
      <meta name="keywords" content="condominio,gestión,administración,comunidad,residencial,finanzas,comunicados" />

      <DashboardView />
    </>
  );
}
