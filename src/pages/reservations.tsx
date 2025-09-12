import { CONFIG } from 'src/config-global';

import { ReservationsView } from '../sections/reservations/view/reservations-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Gestión de Reservas - ${CONFIG.appName}`}</title>

      <ReservationsView />
    </>
  );
}
