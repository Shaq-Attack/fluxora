import { useKrakenOrderBook } from '@fluxora/data';
import type { OrderBook } from '@fluxora/types';
import { useOrderBookStore } from '../store/orderBookStore';

export function useOrderBookPanel(symbol: string): OrderBook | undefined {
  const setOrderBook = useOrderBookStore((s) => s.setOrderBook);

  useKrakenOrderBook({
    symbol,
    depth: 25,
    createWorker: () =>
      new Worker(new URL('../workers/orderBook.worker.ts', import.meta.url), { type: 'module' }),
    onOrderBook: setOrderBook,
    onStatusChange: () => undefined,
  });

  return useOrderBookStore((s) => s.orderBooks[symbol]);
}
