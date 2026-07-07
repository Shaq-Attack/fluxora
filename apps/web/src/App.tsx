import { useHotkeys } from 'react-hotkeys-hook';
import { useShallow } from 'zustand/react/shallow';
import { useKrakenFeed } from '@fluxora/data';
import logoUrl from './assets/logo.svg';
import { ConnectionBadge } from './components/ConnectionBadge';
import { DashboardGrid } from './components/DashboardGrid';
import { ThemeToggle } from './components/ThemeToggle';
import { ToastViewport } from './components/ToastViewport';
import { useConnectionToasts } from './hooks/useConnectionToasts';
import { useLimitOrderFill } from './hooks/useLimitOrderFill';
import { useOrderFillToasts } from './hooks/useOrderFillToasts';
import { reportWsLatency } from './lib/metrics';
import { useLayoutStore } from './store/layoutStore';
import { useMarketStore } from './store/marketStore';
import { useWatchlistStore } from './store/watchlistStore';

function App(): JSX.Element {
  const { setTickers, addTrades, setConnectionStatus, activeSymbol } = useMarketStore(
    useShallow((s) => ({
      setTickers: s.setTickers,
      addTrades: s.addTrades,
      setConnectionStatus: s.setConnectionStatus,
      activeSymbol: s.activeSymbol,
    })),
  );
  const watchlist = useWatchlistStore((s) => s.watchlist);

  useKrakenFeed({
    symbols: watchlist,
    onTicker: setTickers,
    onTrade: addTrades,
    onStatusChange: setConnectionStatus,
    onLatency: reportWsLatency,
  });

  useLimitOrderFill();
  useConnectionToasts();
  useOrderFillToasts();

  useHotkeys('b', () => useLayoutStore.getState().setOrderEntrySide('buy'), {
    preventDefault: true,
    enableOnFormTags: false,
  });
  useHotkeys('s', () => useLayoutStore.getState().setOrderEntrySide('sell'), {
    preventDefault: true,
    enableOnFormTags: false,
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface text-primary">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="" className="size-6 dark:invert" />
          <h1 className="text-lg font-semibold tracking-tight">Fluxora</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectionBadge />
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <DashboardGrid activeSymbol={activeSymbol} />
      </main>
      <ToastViewport />
    </div>
  );
}

export default App;
