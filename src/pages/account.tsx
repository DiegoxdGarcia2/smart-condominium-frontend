import { CONFIG } from 'src/config-global';

import { AccountView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Mi Cuenta - ${CONFIG.appName}`}</title>

      <AccountView />
    </>
  );
}