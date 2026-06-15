import { formatPrice } from '../lib/format';
import { useMarketStore } from '../store/marketStore';

interface TickerPanelProps {
  symbol: string;
}

export function TickerPanel({ symbol }: TickerPanelProps): JSX.Element {
  const ticker = useMarketStore((s) => s.tickers[symbol]);

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted">{symbol}</h2>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-dim">Bid</p>
          <p className="font-mono text-sm tabular-nums text-green-400">
            {formatPrice(ticker?.bid)}
          </p>
        </div>
        <div>
          <p className="text-xs text-dim">Ask</p>
          <p className="font-mono text-sm tabular-nums text-red-400">
            {formatPrice(ticker?.ask)}
          </p>
        </div>
        <div>
          <p className="text-xs text-dim">Last</p>
          <p className="font-mono text-sm tabular-nums text-primary">
            {formatPrice(ticker?.price)}
          </p>
        </div>
      </div>
    </div>
  );
}
