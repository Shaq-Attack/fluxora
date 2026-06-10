import { formatPrice } from '../lib/format';
import { useMarketStore } from '../store/marketStore';

interface TickerPanelProps {
  symbol: string;
}

export function TickerPanel({ symbol }: TickerPanelProps): JSX.Element {
  const ticker = useMarketStore((s) => s.tickers[symbol]);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-300">{symbol}</h2>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-gray-500">Bid</p>
          <p className="font-mono text-sm tabular-nums text-green-400">
            {formatPrice(ticker?.bid)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ask</p>
          <p className="font-mono text-sm tabular-nums text-red-400">
            {formatPrice(ticker?.ask)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Last</p>
          <p className="font-mono text-sm tabular-nums text-white">
            {formatPrice(ticker?.price)}
          </p>
        </div>
      </div>
    </div>
  );
}
