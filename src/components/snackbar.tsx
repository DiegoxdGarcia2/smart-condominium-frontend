import type { VariantType } from 'notistack';

import { useCallback } from 'react';
import { enqueueSnackbar as notistackEnqueue } from 'notistack';

// ----------------------------------------------------------------------

export function useSnackbar() {
  const enqueueSnackbar = useCallback(
    (message: string, options?: { variant?: VariantType }) => {
      notistackEnqueue(message, {
        variant: options?.variant || 'default',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    },
    []
  );

  return {
    enqueueSnackbar,
  };
}
