import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  watchlist: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      watchlist: ['BTC/USD', 'ETH/USD'],

      addSymbol: (symbol) => {
        set((state) => {
          if (state.watchlist.includes(symbol)) return state;
          return { watchlist: [...state.watchlist, symbol] };
        });
      },

      removeSymbol: (symbol) => {
        set((state) => ({ watchlist: state.watchlist.filter((s) => s !== symbol) }));
      },
    }),
    {
      name: 'fluxora-watchlist',
      partialize: (state) => ({ watchlist: state.watchlist }),
    },
  ),
);
