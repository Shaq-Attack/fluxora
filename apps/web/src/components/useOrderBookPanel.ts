import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useKrakenOrderBook } from '@fluxora/data';
import type { OrderBookLevel } from '@fluxora/types';
import { useOrderBookStore } from '../store/orderBookStore';
import type { OrderBookDepth, TickSize } from '../store/orderBookStore';

export interface DepthLevel extends OrderBookLevel {
  /** Cumulative depth share of the visible levels, 0–100, for the background bar. */
  depthPct: number;
}

export interface OrderBookPanelData {
  bids: DepthLevel[];
  asks: DepthLevel[];
}

function aggregateLevels(
  levels: OrderBookLevel[],
  tickSize: TickSize,
  side: 'bid' | 'ask',
): OrderBookLevel[] {
  if (tickSize === 0) return levels;
  const buckets = new Map<number, number>();
  for (const { price, quantity } of levels) {
    // +1e-9 epsilon recovers quotients like 200000.99999997 → 200001 before flooring
    const bucketIndex = Math.floor(price / tickSize + 1e-9);
    const bucketKey = Math.round(bucketIndex * tickSize * 1e8) / 1e8;
    buckets.set(bucketKey, (buckets.get(bucketKey) ?? 0) + quantity);
  }
  const result = Array.from(buckets.entries()).map(([price, quantity]) => ({ price, quantity }));
  return side === 'bid'
    ? result.sort((a, b) => b.price - a.price)
    : result.sort((a, b) => a.price - b.price);
}

function withCumulativeDepth(levels: OrderBookLevel[], visibleCount: OrderBookDepth): DepthLevel[] {
  const visibleLevels = levels.slice(0, visibleCount);
  const totalQuantity = visibleLevels.reduce((sum, level) => sum + level.quantity, 0);
  let cumulativeQuantity = 0;
  return visibleLevels.map((level) => {
    cumulativeQuantity += level.quantity;
    return {
      ...level,
      depthPct: totalQuantity > 0 ? (cumulativeQuantity / totalQuantity) * 100 : 0,
    };
  });
}

export function useOrderBookPanel(symbol: string): OrderBookPanelData | undefined {
  const { depth, tickSize, setOrderBook, orderBook } = useOrderBookStore(
    useShallow((s) => ({
      depth: s.depth,
      tickSize: s.tickSize,
      setOrderBook: s.setOrderBook,
      orderBook: s.orderBooks[symbol],
    })),
  );

  useKrakenOrderBook({
    symbol,
    depth,
    skipChecksum: tickSize > 0,
    createWorker: () =>
      new Worker(new URL('../workers/orderBook.worker.ts', import.meta.url), { type: 'module' }),
    onOrderBook: setOrderBook,
    onStatusChange: () => undefined,
  });

  return useMemo(() => {
    if (orderBook === undefined) return undefined;
    const aggregatedBids = aggregateLevels(orderBook.bids, tickSize, 'bid');
    const aggregatedAsks = aggregateLevels(orderBook.asks, tickSize, 'ask');
    return {
      bids: withCumulativeDepth(aggregatedBids, depth),
      asks: withCumulativeDepth(aggregatedAsks, depth),
    };
  }, [orderBook, depth, tickSize]);
}
