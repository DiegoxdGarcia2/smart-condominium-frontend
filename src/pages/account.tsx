import { CONFIG } from 'src/config-global';

import { AccountView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Mis Cosas - ${CONFIG.appName}`}</title>

      <AccountView />
    </>
  );
}