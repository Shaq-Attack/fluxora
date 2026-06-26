import { useHotkeys } from 'react-hotkeys-hook';
import { useShallow } from 'zustand/react/shallow';
import { useKrakenFeed } from '@fluxora/data';
import { ConnectionBadge } from './components/ConnectionBadge';
import { DashboardGrid } from './components/DashboardGrid';
import { ThemeToggle } from './components/ThemeToggle';
import { useLimitOrderFill } from './hooks/useLimitOrderFill';
import { reportWsLatency } from './lib/metrics';
import { useLayoutStore } from './store/layoutStore';
import { useMarketStore } from './store/marketStore';

function App(): JSX.Element {
  const { setTickers, addTrades, setConnectionStatus, activeSymbol } = useMarketStore(
    useShallow((s) => ({
      setTickers: s.setTickers,
      addTrades: s.addTrades,
      setConnectionStatus: s.setConnectionStatus,
      activeSymbol: s.activeSymbol,
    })),
  );

  useKrakenFeed({
    onTicker: setTickers,
    onTrade: addTrades,
    onStatusChange: setConnectionStatus,
    onLatency: reportWsLatency,
  });

  useLimitOrderFill();

  useHotkeys('b', () => useLayoutStore.getState().setOrderEntrySide('buy'), {
    preventDefault: true,
    enableOnFormTags: false,
  });
  useHotkeys('s', () => useLayoutStore.getState().setOrderEntrySide('sell'), {
    preventDefault: true,
    enableOnFormTags: false,
  });

  return (
    <div className="flex min-h-screen flex-col bg-surface text-primary">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Fluxora</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectionBadge />
        </div>
      </header>
      <DashboardGrid activeSymbol={activeSymbol} />
    </div>
  );
}

export default App;
