import type { Layout } from 'react-resizable-panels';
import { useHotkeys } from 'react-hotkeys-hook';
import { useShallow } from 'zustand/react/shallow';
import { useKrakenFeed } from '@fluxora/data';
import { ConnectionBadge } from './components/ConnectionBadge';
import { ResizableDashboard } from './components/ResizableDashboard';
import { StackedDashboard } from './components/StackedDashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { useLimitOrderFill } from './hooks/useLimitOrderFill';
import { useMediaQuery } from './hooks/useMediaQuery';
import { reportWsLatency } from './lib/metrics';
import { useLayoutStore } from './store/layoutStore';
import { useMarketStore } from './store/marketStore';

// Wide screens keep the drag-to-resize split panes; below this the page scrolls
// as one column with content-sized panels.
const WIDE_SCREEN_QUERY = '(min-width: 1024px)';

function App(): JSX.Element {
  const { setTickers, addTrades, setConnectionStatus, activeSymbol } = useMarketStore(
    useShallow((s) => ({
      setTickers: s.setTickers,
      addTrades: s.addTrades,
      setConnectionStatus: s.setConnectionStatus,
      activeSymbol: s.activeSymbol,
    })),
  );

  const { outerLayout, mainLayout, setOuterLayout, setMainLayout } = useLayoutStore(
    useShallow((s) => ({
      outerLayout: s.outerLayout,
      mainLayout: s.mainLayout,
      setOuterLayout: s.setOuterLayout,
      setMainLayout: s.setMainLayout,
    })),
  );

  const isWideScreen = useMediaQuery(WIDE_SCREEN_QUERY);

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
    <div
      className={
        isWideScreen
          ? 'flex h-screen flex-col overflow-hidden bg-surface text-primary'
          : 'flex min-h-screen flex-col bg-surface text-primary'
      }
    >
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Fluxora</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectionBadge />
        </div>
      </header>
      {isWideScreen ? (
        <ResizableDashboard
          activeSymbol={activeSymbol}
          outerLayout={outerLayout}
          mainLayout={mainLayout}
          onOuterLayoutChange={(layout: Layout) => setOuterLayout(layout)}
          onMainLayoutChange={(layout: Layout) => setMainLayout(layout)}
        />
      ) : (
        <StackedDashboard activeSymbol={activeSymbol} />
      )}
    </div>
  );
}

export default App;
