import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Trade } from '@fluxora/types';
import { PanelShell, Skeleton } from '@fluxora/ui';
import { formatPrice, formatTime, formatQuantity } from '../lib/format';
import { useMarketStore } from '../store/marketStore';
import { StaleFeedOverlay } from './StaleFeedOverlay';

interface TradeTapeProps {
  symbol: string;
}

const ROW_HEIGHT = 28;
const EMPTY_TRADES: Trade[] = [];

function TradeRow({ trade }: { trade: Trade }): JSX.Element {
  const colourClass = trade.side === 'sell' ? 'text-red-400' : 'text-green-400';
  return (
    <div className={`flex items-center gap-3 px-3 font-mono text-xs tabular-nums ${colourClass}`}>
      <span className="w-16 shrink-0 text-dim">{formatTime(trade.timestamp)}</span>
      <span className="w-24 shrink-0 text-right">{formatPrice(trade.price)}</span>
      <span className="w-20 shrink-0 text-right">{formatQuantity(trade.quantity)}</span>
      <span className="w-4 shrink-0">{trade.side === 'buy' ? 'B' : 'S'}</span>
    </div>
  );
}

function TradeTapeVirtualised({ trades }: { trades: Trade[] }): JSX.Element {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      data-testid="trade-tape-feed"
      className="h-64 overflow-auto lg:h-auto lg:min-h-0 lg:flex-1"
    >
      {/* Inline styles here are required by @tanstack/react-virtual for absolute positioning */}
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const trade = trades[virtualItem.index];
          // Guard is load-bearing: virtualizer can emit a stale index for one frame after count changes.
          if (trade === undefined) return null;
          return (
            <div
              key={virtualItem.key}
              className="absolute left-0 top-0 w-full"
              style={{ /* @tanstack/react-virtual */
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TradeRow trade={trade} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TradeTapeSkeleton(): JSX.Element {
  return (
    <div
      aria-label="Loading trades"
      className="flex h-64 flex-col gap-2 overflow-hidden p-3 lg:h-auto lg:min-h-0 lg:flex-1"
      role="status"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-4" />
        </div>
      ))}
    </div>
  );
}

export function TradeTape({ symbol }: TradeTapeProps): JSX.Element {
  const trades = useMarketStore((s) => s.trades[symbol] ?? EMPTY_TRADES);

  return (
    <PanelShell fill className="relative" title={`${symbol} Trades`}>
      {trades.length > 0 && <StaleFeedOverlay />}
      {trades.length === 0 ? <TradeTapeSkeleton /> : <TradeTapeVirtualised trades={trades} />}
    </PanelShell>
  );
}
