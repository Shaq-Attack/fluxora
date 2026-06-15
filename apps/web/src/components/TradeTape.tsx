import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Trade } from '@fluxora/types';
import { formatPrice, formatTime, formatQuantity } from '../lib/format';
import { useMarketStore } from '../store/marketStore';

interface TradeTapeProps {
  symbol: string;
}

const ROW_HEIGHT = 28;
const EMPTY_TRADES: Trade[] = [];

function TradeRow({ trade }: { trade: Trade }): JSX.Element {
  const colourClass = trade.side === 'sell' ? 'text-red-400' : 'text-green-400';
  return (
    <div
      className={`flex items-center gap-3 px-3 font-mono text-xs tabular-nums ${colourClass}`}
    >
      <span className="w-16 shrink-0 text-dim">{formatTime(trade.timestamp)}</span>
      <span className="w-24 shrink-0 text-right">{formatPrice(trade.price)}</span>
      <span className="w-20 shrink-0 text-right">{formatQuantity(trade.quantity)}</span>
      <span className="w-4 shrink-0">{trade.side === 'buy' ? 'B' : 'S'}</span>
    </div>
  );
}

export function TradeTape({ symbol }: TradeTapeProps): JSX.Element {
  const trades = useMarketStore((s) => s.trades[symbol] ?? EMPTY_TRADES);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div className="rounded-lg border border-border bg-surface-elevated">
      <div className="flex items-center border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold text-muted">{symbol} Trades</h2>
      </div>
      <div ref={parentRef} className="h-64 overflow-auto">
        {trades.length === 0 ? (
          <p className="p-3 text-xs text-subtle">Waiting for data…</p>
        ) : (
          // Inline styles here are required by @tanstack/react-virtual for absolute positioning
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const trade = trades[virtualItem.index];
              // Guard is load-bearing: virtualizer can emit a stale index for one frame after count changes.
              if (trade === undefined) return null;
              return (
                <div
                  key={virtualItem.key}
                  style={{ /* @tanstack/react-virtual */
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <TradeRow trade={trade} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
