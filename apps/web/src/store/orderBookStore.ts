import { create } from 'zustand';
import type { OrderBook } from '@fluxora/types';

interface OrderBookState {
  orderBooks: Record<string, OrderBook | undefined>;
  setOrderBook: (ob: OrderBook) => void;
}

export const useOrderBookStore = create<OrderBookState>()((set) => ({
  orderBooks: {},
  setOrderBook: (ob) =>
    set((state) => ({
      orderBooks: { ...state.orderBooks, [ob.symbol]: ob },
    })),
}));
