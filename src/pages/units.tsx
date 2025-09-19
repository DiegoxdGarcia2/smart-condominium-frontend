import { CONFIG } from 'src/config-global';

import { UnitsView } from 'src/sections/units/view';

// ----------------------------------------------------------------------

export default function UnitsPage() {
  return (
    <>
      <title>{`Unidades Residenciales - ${CONFIG.appName}`}</title>

      <UnitsView />
    </>
  );
}