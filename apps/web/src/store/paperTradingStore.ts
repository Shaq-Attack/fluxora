import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderSide, OrderType, PaperOrder, PaperPosition } from '@fluxora/types';

export interface SubmitOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  limitPrice?: number;
  fillPrice: number;
}

interface PaperTradingState {
  cashBalance: number;
  positions: Record<string, PaperPosition>;
  pendingOrders: PaperOrder[];
  filledOrders: PaperOrder[];
  submitOrder: (params: SubmitOrderParams) => { ok: boolean; error?: string };
  checkLimitOrders: (symbol: string, lastPrice: number) => void;
  cancelOrder: (orderId: string) => void;
  resetPortfolio: () => void;
}

interface StateCore {
  cashBalance: number;
  positions: Record<string, PaperPosition>;
}

const INITIAL_CASH = 10_000;

const INITIAL_STATE = {
  cashBalance: INITIAL_CASH,
  positions: {} as Record<string, PaperPosition>,
  pendingOrders: [] as PaperOrder[],
  filledOrders: [] as PaperOrder[],
};

function computeFill(
  core: StateCore,
  order: PaperOrder,
  fillPrice: number,
): { core: StateCore; filledOrder: PaperOrder } {
  const { symbol, side, qty } = order;
  const filledOrder: PaperOrder = {
    ...order,
    status: 'filled',
    avgFillPrice: fillPrice,
    filledAt: Date.now(),
  };

  let newCashBalance = core.cashBalance;
  const newPositions = { ...core.positions };

  if (side === 'buy') {
    newCashBalance -= fillPrice * qty;
    const existing = newPositions[symbol];
    if (existing !== undefined) {
      const totalQty = existing.qty + qty;
      const avgEntry = (existing.qty * existing.avgEntryPrice + qty * fillPrice) / totalQty;
      newPositions[symbol] = { symbol, qty: totalQty, avgEntryPrice: avgEntry };
    } else {
      newPositions[symbol] = { symbol, qty, avgEntryPrice: fillPrice };
    }
  } else {
    newCashBalance += fillPrice * qty;
    const existing = newPositions[symbol];
    const existingQty = existing?.qty ?? 0;
    const remaining = existingQty - qty;
    if (remaining <= 0) {
      delete newPositions[symbol];
    } else if (existing !== undefined) {
      newPositions[symbol] = { ...existing, qty: remaining };
    }
  }

  return { core: { cashBalance: newCashBalance, positions: newPositions }, filledOrder };
}

export const usePaperTradingStore = create<PaperTradingState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      submitOrder: (params) => {
        const { symbol, side, type, qty, limitPrice, fillPrice } = params;
        const { cashBalance, positions, pendingOrders, filledOrders } = get();

        if (qty <= 0) return { ok: false, error: 'Quantity must be greater than zero' };

        if (type === 'limit') {
          if (limitPrice === undefined || limitPrice <= 0) {
            return { ok: false, error: 'Limit price required for limit orders' };
          }
        }

        const executionPrice = type === 'market' ? fillPrice : (limitPrice as number);

        if (side === 'buy') {
          if (cashBalance < qty * executionPrice) {
            return { ok: false, error: 'Insufficient cash balance' };
          }
        } else {
          const position = positions[symbol];
          if (position === undefined || position.qty < qty) {
            return { ok: false, error: 'Insufficient position' };
          }
        }

        const order: PaperOrder = {
          id: crypto.randomUUID(),
          symbol,
          side,
          type,
          qty,
          ...(limitPrice !== undefined && { limitPrice }),
          status: 'pending',
          createdAt: Date.now(),
        };

        if (type === 'market') {
          const { core, filledOrder } = computeFill({ cashBalance, positions }, order, fillPrice);
          set({ ...core, filledOrders: [...filledOrders, filledOrder] });
        } else {
          set({ pendingOrders: [...pendingOrders, order] });
        }

        return { ok: true };
      },

      checkLimitOrders: (symbol, lastPrice) => {
        const { cashBalance, positions, pendingOrders, filledOrders } = get();

        const toFill = pendingOrders.filter((o) => {
          if (o.symbol !== symbol || o.limitPrice === undefined) return false;
          return o.side === 'buy' ? lastPrice <= o.limitPrice : lastPrice >= o.limitPrice;
        });

        if (toFill.length === 0) return;

        let core: StateCore = { cashBalance, positions };
        const newlyFilled: PaperOrder[] = [];

        for (const order of toFill) {
          if (order.limitPrice === undefined) continue;
          // Re-validate at fill time: funds/holdings may have changed since
          // submission — skip (keep pending) rather than go negative
          if (order.side === 'buy' && core.cashBalance < order.qty * order.limitPrice) continue;
          if (order.side === 'sell' && (core.positions[order.symbol]?.qty ?? 0) < order.qty) {
            continue;
          }
          const result = computeFill(core, order, order.limitPrice);
          core = result.core;
          newlyFilled.push(result.filledOrder);
        }

        if (newlyFilled.length === 0) return;

        const filledIds = new Set(newlyFilled.map((o) => o.id));
        set({
          ...core,
          pendingOrders: pendingOrders.filter((o) => !filledIds.has(o.id)),
          filledOrders: [...filledOrders, ...newlyFilled],
        });
      },

      cancelOrder: (orderId) => {
        set((state) => {
          const order = state.pendingOrders.find((o) => o.id === orderId);
          if (order === undefined) return state;
          return {
            pendingOrders: state.pendingOrders.filter((o) => o.id !== orderId),
            filledOrders: [...state.filledOrders, { ...order, status: 'cancelled' }],
          };
        });
      },

      resetPortfolio: () => set(INITIAL_STATE),
    }),
    {
      name: 'fluxora-paper-trading',
      partialize: (state) => ({
        cashBalance: state.cashBalance,
        positions: state.positions,
        pendingOrders: state.pendingOrders,
        filledOrders: state.filledOrders,
      }),
    },
  ),
);
