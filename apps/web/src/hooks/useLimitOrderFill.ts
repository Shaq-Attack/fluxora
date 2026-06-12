import { useEffect } from 'react';
import { useMarketStore } from '../store/marketStore';
import { usePaperTradingStore } from '../store/paperTradingStore';

export function useLimitOrderFill(): void {
  const tickers = useMarketStore((s) => s.tickers);
  const checkLimitOrders = usePaperTradingStore((s) => s.checkLimitOrders);

  useEffect(() => {
    for (const [symbol, ticker] of Object.entries(tickers)) {
      if (ticker !== undefined) checkLimitOrders(symbol, ticker.price);
    }
  }, [tickers, checkLimitOrders]);
}
