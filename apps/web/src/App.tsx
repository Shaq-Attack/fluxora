import { Group, Panel, Separator } from 'react-resizable-panels';
import type { Layout } from 'react-resizable-panels';
import { useHotkeys } from 'react-hotkeys-hook';
import { useShallow } from 'zustand/react/shallow';
import { useKrakenFeed } from '@fluxora/data';
import { CandlestickChartPanel } from './components/CandlestickChartPanel';
import { ConnectionBadge } from './components/ConnectionBadge';
import { OrderBookPanel } from './components/OrderBookPanel';
import { OrderEntryPanel } from './components/OrderEntryPanel';
import { PortfolioPanel } from './components/PortfolioPanel';
import { TickerPanel } from './components/TickerPanel';
import { TradeTape } from './components/TradeTape';
import { WatchlistPanel } from './components/WatchlistPanel';
import { useLimitOrderFill } from './hooks/useLimitOrderFill';
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

  const { outerLayout, mainLayout, setOuterLayout, setMainLayout } = useLayoutStore(
    useShallow((s) => ({
      outerLayout: s.outerLayout,
      mainLayout: s.mainLayout,
      setOuterLayout: s.setOuterLayout,
      setMainLayout: s.setMainLayout,
    })),
  );

  useKrakenFeed({
    onTicker: setTickers,
    onTrade: addTrades,
    onStatusChange: setConnectionStatus,
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
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950 text-white">
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Fluxora</h1>
        <ConnectionBadge />
      </header>
      <Group
        orientation="horizontal"
        defaultLayout={outerLayout}
        onLayoutChanged={(layout: Layout) => setOuterLayout(layout)}
        className="flex-1"
      >
        <Panel id="sidebar" minSize={15} className="overflow-auto">
          <WatchlistPanel />
        </Panel>
        <Separator className="w-1 cursor-col-resize bg-gray-800 transition-colors hover:bg-blue-500" />
        <Panel id="main" minSize={40} className="overflow-auto">
          <Group
            orientation="vertical"
            defaultLayout={mainLayout}
            onLayoutChanged={(layout: Layout) => setMainLayout(layout)}
          >
            <Panel id="chart" minSize={15} className="overflow-auto">
              <CandlestickChartPanel symbol={activeSymbol} />
            </Panel>
            <Separator className="h-1 cursor-row-resize bg-gray-800 transition-colors hover:bg-blue-500" />
            <Panel id="market-data" minSize={10} className="overflow-auto">
              <TickerPanel symbol={activeSymbol} />
              <TradeTape symbol={activeSymbol} />
            </Panel>
            <Separator className="h-1 cursor-row-resize bg-gray-800 transition-colors hover:bg-blue-500" />
            <Panel id="order-book" minSize={10} className="overflow-auto">
              <OrderBookPanel key={activeSymbol} symbol={activeSymbol} />
            </Panel>
            <Separator className="h-1 cursor-row-resize bg-gray-800 transition-colors hover:bg-blue-500" />
            <Panel id="trading" minSize={10} className="overflow-auto">
              <OrderEntryPanel symbol={activeSymbol} />
              <PortfolioPanel />
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  );
}

export default App;
