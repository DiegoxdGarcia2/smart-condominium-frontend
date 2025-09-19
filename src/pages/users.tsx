import { CONFIG } from 'src/config-global';

import { UsersView } from 'src/sections/users/view';

// ----------------------------------------------------------------------

export default function UsersPage() {
  return (
    <>
      <title>{`Gestión de Usuarios - ${CONFIG.appName}`}</title>

      <UsersView />
    </>
  );
}