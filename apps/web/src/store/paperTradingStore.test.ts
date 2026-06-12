import { describe, it, expect, beforeEach } from 'vitest';
import { usePaperTradingStore } from './paperTradingStore';

const SYMBOL = 'BTC/USD';

function submitMarket(side: 'buy' | 'sell', qty: number, fillPrice: number) {
  return usePaperTradingStore
    .getState()
    .submitOrder({ symbol: SYMBOL, side, type: 'market', qty, fillPrice });
}

function submitLimit(side: 'buy' | 'sell', qty: number, limitPrice: number, fillPrice: number) {
  return usePaperTradingStore
    .getState()
    .submitOrder({ symbol: SYMBOL, side, type: 'limit', qty, limitPrice, fillPrice });
}

describe('usePaperTradingStore', () => {
  beforeEach(() => {
    usePaperTradingStore.getState().resetPortfolio();
  });

  it('starts with $10,000 cash and no positions', () => {
    const { cashBalance, positions, pendingOrders } = usePaperTradingStore.getState();
    expect(cashBalance).toBe(10_000);
    expect(positions).toEqual({});
    expect(pendingOrders).toEqual([]);
  });

  it('market buy debits cash and opens a position at the fill price', () => {
    const result = submitMarket('buy', 10, 100);
    expect(result.ok).toBe(true);

    const { cashBalance, positions } = usePaperTradingStore.getState();
    expect(cashBalance).toBe(9_000);
    expect(positions[SYMBOL]).toEqual({ symbol: SYMBOL, qty: 10, avgEntryPrice: 100 });
  });

  it('repeat buys compute a weighted average entry price', () => {
    submitMarket('buy', 10, 100);
    submitMarket('buy', 10, 200);

    const position = usePaperTradingStore.getState().positions[SYMBOL];
    expect(position?.qty).toBe(20);
    expect(position?.avgEntryPrice).toBe(150);
  });

  it('selling reduces quantity, credits cash, and keeps the average entry price', () => {
    submitMarket('buy', 20, 150);
    submitMarket('sell', 5, 300);

    const { cashBalance, positions } = usePaperTradingStore.getState();
    expect(positions[SYMBOL]).toEqual({ symbol: SYMBOL, qty: 15, avgEntryPrice: 150 });
    expect(cashBalance).toBe(10_000 - 20 * 150 + 5 * 300);
  });

  it('selling the entire position removes it', () => {
    submitMarket('buy', 10, 100);
    submitMarket('sell', 10, 100);
    expect(usePaperTradingStore.getState().positions[SYMBOL]).toBeUndefined();
  });

  it('rejects buys exceeding the cash balance', () => {
    const result = submitMarket('buy', 1, 999_999);
    expect(result).toEqual({ ok: false, error: 'Insufficient cash balance' });
    expect(usePaperTradingStore.getState().cashBalance).toBe(10_000);
  });

  it('rejects sells exceeding the held quantity', () => {
    submitMarket('buy', 1, 100);
    const result = submitMarket('sell', 2, 100);
    expect(result).toEqual({ ok: false, error: 'Insufficient position' });
  });

  it('rejects non-positive quantities and limit orders without a limit price', () => {
    expect(submitMarket('buy', 0, 100).ok).toBe(false);
    expect(
      usePaperTradingStore
        .getState()
        .submitOrder({ symbol: SYMBOL, side: 'buy', type: 'limit', qty: 1, fillPrice: 100 }).ok,
    ).toBe(false);
  });

  it('stores limit orders as pending until the market crosses the limit', () => {
    submitLimit('buy', 10, 90, 100);
    expect(usePaperTradingStore.getState().pendingOrders).toHaveLength(1);

    usePaperTradingStore.getState().checkLimitOrders(SYMBOL, 95);
    expect(usePaperTradingStore.getState().pendingOrders).toHaveLength(1);
    expect(usePaperTradingStore.getState().cashBalance).toBe(10_000);

    usePaperTradingStore.getState().checkLimitOrders(SYMBOL, 90);
    const { cashBalance, positions, pendingOrders } = usePaperTradingStore.getState();
    expect(pendingOrders).toHaveLength(0);
    expect(cashBalance).toBe(10_000 - 10 * 90); // fills at the limit price
    expect(positions[SYMBOL]).toEqual({ symbol: SYMBOL, qty: 10, avgEntryPrice: 90 });
  });

  it('fills sell limits when the price rises to the limit', () => {
    submitMarket('buy', 10, 100);
    submitLimit('sell', 10, 120, 100);

    usePaperTradingStore.getState().checkLimitOrders(SYMBOL, 120);
    const { cashBalance, positions } = usePaperTradingStore.getState();
    expect(positions[SYMBOL]).toBeUndefined();
    expect(cashBalance).toBe(10_000 - 10 * 100 + 10 * 120);
  });

  it('does not fill the same limit order twice on repeated ticks', () => {
    submitLimit('buy', 10, 90, 100);
    usePaperTradingStore.getState().checkLimitOrders(SYMBOL, 90);
    usePaperTradingStore.getState().checkLimitOrders(SYMBOL, 90);

    const { filledOrders, cashBalance } = usePaperTradingStore.getState();
    expect(filledOrders.filter((o) => o.status === 'filled')).toHaveLength(1);
    expect(cashBalance).toBe(10_000 - 10 * 90);
  });

  it('keeps a sell limit pending when the position was already closed', () => {
    submitMarket('buy', 10, 100);
    submitLimit('sell', 10, 120, 100);
    submitMarket('sell', 10, 100); // close the position before the limit triggers

    usePaperTradingStore.getState().checkLimitOrders(SYMBOL, 120);

    const { pendingOrders, cashBalance } = usePaperTradingStore.getState();
    expect(pendingOrders).toHaveLength(1); // not filled — no free money
    expect(cashBalance).toBe(10_000);
  });

  it('keeps a buy limit pending when cash is no longer sufficient', () => {
    submitLimit('buy', 10, 900, 1000); // costs 9,000 when it fills
    submitMarket('buy', 5, 1000); // spend 5,000 first

    usePaperTradingStore.getState().checkLimitOrders(SYMBOL, 900);

    const { pendingOrders, cashBalance } = usePaperTradingStore.getState();
    expect(pendingOrders).toHaveLength(1);
    expect(cashBalance).toBe(5_000);
  });

  it('cancelOrder moves a pending order to cancelled', () => {
    submitLimit('buy', 1, 90, 100);
    const order = usePaperTradingStore.getState().pendingOrders[0];
    if (order === undefined) throw new Error('expected a pending order');

    usePaperTradingStore.getState().cancelOrder(order.id);
    const { pendingOrders, filledOrders } = usePaperTradingStore.getState();
    expect(pendingOrders).toHaveLength(0);
    expect(filledOrders[0]?.status).toBe('cancelled');
  });
});
