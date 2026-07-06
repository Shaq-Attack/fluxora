import { useMarketStore } from '../store/marketStore';

/**
 * Dims a data panel and shows a "Stale" chip while the market feed is down.
 * Render inside a `relative` container, only when the panel already has data —
 * panels without data show their skeleton state instead.
 */
export function StaleFeedOverlay(): JSX.Element | null {
  const status = useMarketStore((s) => s.connectionStatus);
  if (status === 'connected') return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center rounded-lg bg-surface/60 pt-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
        <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
        Stale — reconnecting…
      </span>
    </div>
  );
}
