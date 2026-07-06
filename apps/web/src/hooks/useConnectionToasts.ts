import { useEffect, useRef } from 'react';
import type { ConnectionStatus } from '@fluxora/types';
import { useMarketStore } from '../store/marketStore';
import { pushToast } from '../store/toastStore';

function isDown(status: ConnectionStatus): boolean {
  return status === 'disconnected' || status === 'error';
}

/**
 * Fires transient toasts on feed-status transitions: an error toast when the
 * feed drops, a success toast when it comes back. Silent on the initial
 * connect so the app doesn't greet the user with a notification.
 */
export function useConnectionToasts(): void {
  const status = useMarketStore((s) => s.connectionStatus);
  const prevStatusRef = useRef(status);
  const hasDroppedRef = useRef(false);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (status === prev) return;

    if (isDown(status) && !isDown(prev)) {
      hasDroppedRef.current = true;
      pushToast({ variant: 'error', message: 'Market feed disconnected — reconnecting…' });
    } else if (status === 'connected' && hasDroppedRef.current) {
      hasDroppedRef.current = false;
      pushToast({ variant: 'success', message: 'Market feed reconnected' });
    }
  }, [status]);
}
