import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { PaperOrder } from '@fluxora/types';
import { useMarketStore } from '../store/marketStore';
import { usePaperTradingStore } from '../store/paperTradingStore';

export interface PositionRow {
  symbol: string;
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  currentValue: number;
  unrealisedPnl: number;
}

interface PortfolioSummary {
  cashBalance: number;
  totalValue: number;
  totalUnrealisedPnl: number;
}

export interface UsePortfolioPanelResult {
  summary: PortfolioSummary;
  positionRows: PositionRow[];
  pendingOrders: PaperOrder[];
  handleCancelOrder: (orderId: string) => void;
  handleReset: () => void;
}

export function usePortfolioPanel(): UsePortfolioPanelResult {
  const { cashBalance, positions, pendingOrders, cancelOrder, resetPortfolio } =
    usePaperTradingStore(
      useShallow((s) => ({
        cashBalance: s.cashBalance,
        positions: s.positions,
        pendingOrders: s.pendingOrders,
        cancelOrder: s.cancelOrder,
        resetPortfolio: s.resetPortfolio,
      })),
    );
  const tickers = useMarketStore((s) => s.tickers);

  const positionRows: PositionRow[] = Object.values(positions).map((pos) => {
    const currentPrice = tickers[pos.symbol]?.price ?? pos.avgEntryPrice;
    const currentValue = currentPrice * pos.qty;
    const unrealisedPnl = (currentPrice - pos.avgEntryPrice) * pos.qty;
    return { ...pos, currentPrice, currentValue, unrealisedPnl };
  });

  const totalUnrealisedPnl = positionRows.reduce((sum, r) => sum + r.unrealisedPnl, 0);
  const totalValue = cashBalance + positionRows.reduce((sum, r) => sum + r.currentValue, 0);

  const handleCancelOrder = useCallback(
    (orderId: string) => {
      cancelOrder(orderId);
    },
    [cancelOrder],
  );

  const handleReset = useCallback(() => {
    resetPortfolio();
  }, [resetPortfolio]);

  return {
    summary: { cashBalance, totalValue, totalUnrealisedPnl },
    positionRows,
    pendingOrders,
    handleCancelOrder,
    handleReset,
  };
}
