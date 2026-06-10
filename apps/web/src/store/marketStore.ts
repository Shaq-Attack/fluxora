import { create } from 'zustand';
import type { ConnectionStatus, Ticker, Trade } from '@fluxora/types';

const TRADE_CAP = 500;

interface MarketState {
  tickers: Record<string, Ticker | undefined>;
  trades: Record<string, Trade[] | undefined>;
  connectionStatus: ConnectionStatus;
  setTickers: (tickers: Ticker[]) => void;
  addTrades: (trades: Trade[]) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export const useMarketStore = create<MarketState>()((set) => ({
  tickers: {},
  trades: {},
  connectionStatus: 'disconnected',
  setTickers: (incoming) =>
    set((state) => {
      if (incoming.length === 0) return state;
      const patch: Record<string, Ticker> = {};
      for (const ticker of incoming) patch[ticker.symbol] = ticker;
      return { tickers: { ...state.tickers, ...patch } };
    }),
  addTrades: (incoming) =>
    set((state) => {
      if (incoming.length === 0) return state;
      // Group by symbol so all affected symbols are updated in a single set() call.
      const bySymbol = new Map<string, Trade[]>();
      for (const trade of incoming) {
        const bucket = bySymbol.get(trade.symbol);
        if (bucket) bucket.push(trade);
        else bySymbol.set(trade.symbol, [trade]);
      }
      const updatedTrades = { ...state.trades };
      for (const [symbol, newTrades] of bySymbol) {
        const existing = updatedTrades[symbol] ?? [];
        // Kraken sends trades oldest-first within a frame; reverse so newest lands at index 0.
        updatedTrades[symbol] = [...newTrades.reverse(), ...existing].slice(0, TRADE_CAP);
      }
      return { trades: updatedTrades };
    }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));
