import type { ConnectionStatus } from '@fluxora/types';
import { useMarketStore } from '../store/marketStore';

type StatusConfig = {
  label: string;
  className: string;
  dotClassName: string;
};

const STATUS_CONFIG: Record<ConnectionStatus, StatusConfig> = {
  connected: {
    label: 'Live',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    dotClassName: 'bg-green-400',
  },
  connecting: {
    label: 'Connecting',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dotClassName: 'bg-amber-400 animate-pulse',
  },
  disconnected: {
    label: 'Disconnected',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    dotClassName: 'bg-red-400',
  },
  error: {
    label: 'Error',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    dotClassName: 'bg-red-400',
  },
};

export function ConnectionBadge(): JSX.Element {
  const status = useMarketStore((s) => s.connectionStatus);
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotClassName}`} />
      {config.label}
    </span>
  );
}
