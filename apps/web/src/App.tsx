import { useShallow } from 'zustand/react/shallow';
import { useKrakenFeed } from '@fluxora/data';
import { CandlestickChartPanel } from './components/CandlestickChartPanel';
import { ConnectionBadge } from './components/ConnectionBadge';
import { OrderBookPanel } from './components/OrderBookPanel';
import { TickerPanel } from './components/TickerPanel';
import { TradeTape } from './components/TradeTape';
import { useMarketStore } from './store/marketStore';

const SYMBOLS = ['BTC/USD', 'ETH/USD'] as const;

function App(): JSX.Element {
  const { setTickers, addTrades, setConnectionStatus } = useMarketStore(
    useShallow((s) => ({
      setTickers: s.setTickers,
      addTrades: s.addTrades,
      setConnectionStatus: s.setConnectionStatus,
    })),
  );

  useKrakenFeed({
    onTicker: setTickers,
    onTrade: addTrades,
    onStatusChange: setConnectionStatus,
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Fluxora</h1>
        <ConnectionBadge />
      </header>
      <main className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        {SYMBOLS.map((symbol) => (
          <div key={symbol} className="flex flex-col gap-4">
            <CandlestickChartPanel symbol={symbol} />
            <TickerPanel symbol={symbol} />
            <TradeTape symbol={symbol} />
            <OrderBookPanel symbol={symbol} />
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
