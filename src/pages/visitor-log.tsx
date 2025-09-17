import { CONFIG } from 'src/config-global';

import { VisitorLogView } from '../sections/visitor-log/view/visitor-log-view';

// ----------------------------------------------------------------------

export default function VisitorLogPage() {
  return (
    <>
      <title>{`Registro de Visitas - ${CONFIG.appName}`}</title>

      <VisitorLogView />
    </>
  );
}