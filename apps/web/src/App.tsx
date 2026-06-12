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
  });

  useLimitOrderFill();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Fluxora</h1>
        <ConnectionBadge />
      </header>
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <WatchlistPanel />
        </aside>
        <main className="flex flex-col gap-4 lg:col-span-3">
          <CandlestickChartPanel symbol={activeSymbol} />
          <TickerPanel symbol={activeSymbol} />
          <TradeTape symbol={activeSymbol} />
          <OrderBookPanel key={activeSymbol} symbol={activeSymbol} />
          <OrderEntryPanel symbol={activeSymbol} />
          <PortfolioPanel />
        </main>
      </div>
    </div>
  );
}

export default App;
