import { useMemo } from 'react';
import { useKrakenOrderBook } from '@fluxora/data';
import type { OrderBookLevel } from '@fluxora/types';
import { useOrderBookStore } from '../store/orderBookStore';

const VISIBLE_LEVELS = 10;

export interface DepthLevel extends OrderBookLevel {
  /** Cumulative depth share of the visible levels, 0–100, for the background bar. */
  depthPct: number;
}

export interface OrderBookPanelData {
  bids: DepthLevel[];
  asks: DepthLevel[];
}

function withCumulativeDepth(levels: OrderBookLevel[]): DepthLevel[] {
  const visibleLevels = levels.slice(0, VISIBLE_LEVELS);
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
  const setOrderBook = useOrderBookStore((s) => s.setOrderBook);

  useKrakenOrderBook({
    symbol,
    depth: 25,
    createWorker: () =>
      new Worker(new URL('../workers/orderBook.worker.ts', import.meta.url), { type: 'module' }),
    onOrderBook: setOrderBook,
    onStatusChange: () => undefined,
  });

  const orderBook = useOrderBookStore((s) => s.orderBooks[symbol]);

  return useMemo(() => {
    if (orderBook === undefined) return undefined;
    return {
      bids: withCumulativeDepth(orderBook.bids),
      asks: withCumulativeDepth(orderBook.asks),
    };
  }, [orderBook]);
}
