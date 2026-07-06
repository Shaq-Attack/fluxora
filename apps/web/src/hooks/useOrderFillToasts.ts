import { useEffect, useRef } from 'react';
import { usePaperTradingStore } from '../store/paperTradingStore';
import { pushToast } from '../store/toastStore';
import { formatPrice, formatQuantity } from '../lib/format';

/**
 * Toasts limit-order fills. These happen asynchronously when the market
 * crosses the limit price, so without a toast the fill is invisible until the
 * user scrolls to the portfolio panel. Market orders are toasted at submit
 * time by the order-entry panel, not here.
 */
export function useOrderFillToasts(): void {
  const filledOrders = usePaperTradingStore((s) => s.filledOrders);
  const seenIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    // First run: baseline the persisted history so old fills don't toast on load
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(filledOrders.map((order) => order.id));
      return;
    }
    for (const order of filledOrders) {
      if (seenIdsRef.current.has(order.id)) continue;
      seenIdsRef.current.add(order.id);
      if (order.type !== 'limit' || order.status !== 'filled') continue;
      pushToast({
        variant: 'success',
        message: `Limit ${order.side} filled: ${formatQuantity(order.qty)} ${order.symbol} @ $${formatPrice(order.avgFillPrice)}`,
      });
    }
  }, [filledOrders]);
}
