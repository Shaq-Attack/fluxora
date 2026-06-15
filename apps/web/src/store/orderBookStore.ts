import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderBook } from '@fluxora/types';

export type OrderBookDepth = 10 | 25 | 50;
export type TickSize = 0 | 0.1 | 1 | 10;

interface OrderBookState {
  orderBooks: Record<string, OrderBook | undefined>;
  depth: OrderBookDepth;
  tickSize: TickSize;
  setOrderBook: (ob: OrderBook) => void;
  setDepth: (depth: OrderBookDepth) => void;
  setTickSize: (tickSize: TickSize) => void;
}

export const useOrderBookStore = create<OrderBookState>()(
  persist(
    (set) => ({
      orderBooks: {},
      depth: 25,
      tickSize: 0,
      setOrderBook: (ob) =>
        set((state) => ({
          orderBooks: { ...state.orderBooks, [ob.symbol]: ob },
        })),
      setDepth: (depth) => set({ depth }),
      setTickSize: (tickSize) => set({ tickSize }),
    }),
    {
      name: 'fluxora-order-book-prefs',
      version: 1,
      partialize: (state) => ({ depth: state.depth, tickSize: state.tickSize }),
      migrate: (stored: unknown) => {
        const persisted =
          typeof stored === 'object' && stored !== null
            ? (stored as Record<string, unknown>)
            : {};
        const rawDepth = persisted.depth;
        const rawTickSize = persisted.tickSize;
        return {
          depth: rawDepth === 10 || rawDepth === 25 || rawDepth === 50 ? rawDepth : 25,
          tickSize:
            rawTickSize === 0 || rawTickSize === 0.1 || rawTickSize === 1 || rawTickSize === 10
              ? rawTickSize
              : 0,
        };
      },
    },
  ),
);
