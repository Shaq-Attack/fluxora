import { PanelShell, Skeleton } from '@fluxora/ui';
import { StaleFeedOverlay } from './StaleFeedOverlay';
import { useOrderBookPanel } from './useOrderBookPanel';
import { useOrderBookStore } from '../store/orderBookStore';
import type { OrderBookDepth, TickSize } from '../store/orderBookStore';
import { formatPrice, formatQuantity } from '../lib/format';

interface OrderBookPanelProps {
  symbol: string;
}

export function OrderBookPanel({ symbol }: OrderBookPanelProps): JSX.Element {
  const orderBook = useOrderBookPanel(symbol);

  const depth = useOrderBookStore((s) => s.depth);
  const tickSize = useOrderBookStore((s) => s.tickSize);

  if (orderBook === undefined) {
    return (
      <PanelShell>
        <div className="flex items-center gap-3 border-b border-border px-3 py-2 pr-9">
          <span className="text-sm font-semibold text-muted">{symbol} Order Book</span>
        </div>
        <div aria-label="Loading order book" className="grid grid-cols-2 gap-px bg-border" role="status">
          {[0, 1].map((col) => (
            <div key={col} className="bg-surface-elevated px-3 py-1">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="grid grid-cols-2 gap-1 py-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12 justify-self-end" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </PanelShell>
    );
  }

  const { bids: bidsWithDepth, asks: asksWithDepth } = orderBook;

  return (
    <PanelShell className="relative">
      <StaleFeedOverlay />
      <div className="flex items-center gap-3 border-b border-border px-3 py-2 pr-9">
        <span className="text-sm font-semibold text-muted">{symbol} Order Book</span>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={depth}
            onChange={(e) => useOrderBookStore.getState().setDepth(Number(e.target.value) as OrderBookDepth)}
            className="rounded bg-surface-strong px-2 py-0.5 text-xs text-muted"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <select
            value={tickSize}
            onChange={(e) => useOrderBookStore.getState().setTickSize(Number(e.target.value) as TickSize)}
            className="rounded bg-surface-strong px-2 py-0.5 text-xs text-muted"
          >
            <option value={0}>None</option>
            <option value={0.1}>$0.10</option>
            <option value={1}>$1</option>
            <option value={10}>$10</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-surface-elevated">
          <div className="grid grid-cols-2 gap-1 px-3 py-1">
            <span className="text-xs text-dim">Price</span>
            <span className="text-right text-xs text-dim">Size</span>
          </div>
          {bidsWithDepth.map((level) => (
            <div key={level.price} className="relative px-3 py-0.5">
              {/* depth bar — runtime width, no static Tailwind equivalent */}
              <div
                className="absolute inset-y-0 left-0 bg-green-500/10"
                style={{ width: `${level.depthPct}%` }}
              />
              <div className="relative z-10 grid grid-cols-2 gap-1">
                <span className="font-mono text-xs tabular-nums text-green-400">
                  {formatPrice(level.price)}
                </span>
                <span className="text-right font-mono text-xs tabular-nums text-dim">
                  {formatQuantity(level.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-surface-elevated">
          <div className="grid grid-cols-2 gap-1 px-3 py-1">
            <span className="text-xs text-dim">Price</span>
            <span className="text-right text-xs text-dim">Size</span>
          </div>
          {asksWithDepth.map((level) => (
            <div key={level.price} className="relative px-3 py-0.5">
              {/* depth bar — runtime width, no static Tailwind equivalent */}
              <div
                className="absolute inset-y-0 left-0 bg-red-500/10"
                style={{ width: `${level.depthPct}%` }}
              />
              <div className="relative z-10 grid grid-cols-2 gap-1">
                <span className="font-mono text-xs tabular-nums text-red-400">
                  {formatPrice(level.price)}
                </span>
                <span className="text-right font-mono text-xs tabular-nums text-dim">
                  {formatQuantity(level.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}
