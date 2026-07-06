import { PriceChange, Skeleton } from '@fluxora/ui';
import { formatPrice } from '../lib/format';
import { useMarketStore } from '../store/marketStore';
import { StaleFeedOverlay } from './StaleFeedOverlay';

interface TickerPanelProps {
  symbol: string;
}

type TickerStat = {
  label: string;
  direction: 'up' | 'down' | 'neutral';
  getValue: (ticker: { bid: number; ask: number; price: number }) => number;
};

const TICKER_STATS: TickerStat[] = [
  { label: 'Bid', direction: 'up', getValue: (t) => t.bid },
  { label: 'Ask', direction: 'down', getValue: (t) => t.ask },
  { label: 'Last', direction: 'neutral', getValue: (t) => t.price },
];

export function TickerPanel({ symbol }: TickerPanelProps): JSX.Element {
  const ticker = useMarketStore((s) => s.tickers[symbol]);

  return (
    <div className="relative rounded-lg border border-border bg-surface-elevated p-4">
      {ticker !== undefined && <StaleFeedOverlay />}
      <h2 className="mb-3 pr-9 text-sm font-semibold text-muted">{symbol}</h2>
      <div className="grid grid-cols-3 gap-3">
        {TICKER_STATS.map(({ label, direction, getValue }) => (
          <div key={label}>
            <p className="text-xs text-dim">{label}</p>
            {ticker === undefined ? (
              <Skeleton className="mt-1 h-4 w-20" />
            ) : (
              <p className="text-sm">
                <PriceChange direction={direction} value={formatPrice(getValue(ticker))} />
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
