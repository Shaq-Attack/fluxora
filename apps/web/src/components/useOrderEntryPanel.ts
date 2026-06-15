import { useState, useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { OrderSide, OrderType, Ticker } from '@fluxora/types';
import { useMarketStore } from '../store/marketStore';
import { usePaperTradingStore } from '../store/paperTradingStore';
import { useLayoutStore } from '../store/layoutStore';

interface FormState {
  side: OrderSide;
  orderType: OrderType;
  qty: string;
  limitPrice: string;
  error: string | null;
  successMsg: string | null;
}

interface FormHandlers {
  handleSideChange: (side: OrderSide) => void;
  handleOrderTypeChange: (type: OrderType) => void;
  handleQtyChange: (value: string) => void;
  handleLimitPriceChange: (value: string) => void;
  handleQuickFill: (pct: number) => void;
  handleSubmit: () => void;
}

interface FormData {
  ticker: Ticker | undefined;
  cashBalance: number;
  positionQty: number;
  isSubmitDisabled: boolean;
}

export interface UseOrderEntryPanelResult {
  form: FormState;
  handlers: FormHandlers;
  data: FormData;
}

export function useOrderEntryPanel(symbol: string): UseOrderEntryPanelResult {
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [qty, setQty] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { cashBalance, positions, submitOrder } = usePaperTradingStore(
    useShallow((s) => ({
      cashBalance: s.cashBalance,
      positions: s.positions,
      submitOrder: s.submitOrder,
    })),
  );
  const ticker = useMarketStore((s) => s.tickers[symbol]);
  const positionQty = positions[symbol]?.qty ?? 0;

  const orderEntrySide = useLayoutStore((s) => s.orderEntrySide);

  useEffect(() => {
    setSide(orderEntrySide);
  }, [orderEntrySide]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleSideChange = useCallback((newSide: OrderSide) => {
    setSide(newSide);
    setError(null);
  }, []);

  const handleOrderTypeChange = useCallback((newType: OrderType) => {
    setOrderType(newType);
    setError(null);
  }, []);

  const handleQtyChange = useCallback((value: string) => {
    setQty(value);
    setError(null);
  }, []);

  const handleLimitPriceChange = useCallback((value: string) => {
    setLimitPrice(value);
    setError(null);
  }, []);

  const handleQuickFill = useCallback(
    (pct: number) => {
      if (ticker === undefined || !Number.isFinite(ticker.price) || ticker.price <= 0) return;
      const availableQty = side === 'buy' ? cashBalance / ticker.price : positionQty;
      // Floor at 6 dp so a 100% fill never rounds above the available balance
      const flooredQty = Math.floor(availableQty * pct * 1e6) / 1e6;
      setQty(flooredQty.toFixed(6));
      setError(null);
    },
    [ticker, side, cashBalance, positionQty],
  );

  const handleSubmit = useCallback(() => {
    if (ticker === undefined) return;

    const parsedQty = parseFloat(qty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('Enter a valid quantity');
      return;
    }

    let parsedLimitPrice: number | undefined;
    if (orderType === 'limit') {
      parsedLimitPrice = parseFloat(limitPrice);
      if (isNaN(parsedLimitPrice) || parsedLimitPrice <= 0) {
        setError('Enter a valid limit price');
        return;
      }
    }

    const result = submitOrder({
      symbol,
      side,
      type: orderType,
      qty: parsedQty,
      ...(parsedLimitPrice !== undefined && { limitPrice: parsedLimitPrice }),
      fillPrice: ticker.price,
    });

    if (!result.ok) {
      setError(result.error ?? 'Order failed');
      return;
    }

    setQty('');
    setLimitPrice('');
    setError(null);
    setSuccessMsg(orderType === 'market' ? 'Order filled' : 'Limit order placed');

    if (successTimerRef.current !== null) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMsg(null), 2000);
  }, [ticker, qty, limitPrice, orderType, side, symbol, submitOrder]);

  return {
    form: { side, orderType, qty, limitPrice, error, successMsg },
    handlers: {
      handleSideChange,
      handleOrderTypeChange,
      handleQtyChange,
      handleLimitPriceChange,
      handleQuickFill,
      handleSubmit,
    },
    data: {
      ticker,
      cashBalance,
      positionQty,
      isSubmitDisabled: ticker === undefined,
    },
  };
}
