import { describe, it, expect, beforeEach } from 'vitest';
import type { OrderBook } from '@fluxora/types';
import { useOrderBookStore } from './orderBookStore';

function makeOrderBook(symbol: string): OrderBook {
  return {
    symbol,
    exchange: 'kraken',
    bids: [
      { price: 50000, quantity: 1.5 },
      { price: 49999, quantity: 0.8 },
    ],
    asks: [
      { price: 50001, quantity: 1.2 },
      { price: 50002, quantity: 0.6 },
    ],
    timestamp: Date.now(),
  };
}

describe('useOrderBookStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useOrderBookStore.setState({ orderBooks: {}, depth: 25, tickSize: 0 });
  });

  it('starts with depth 25, tickSize 0, and no order books', () => {
    const state = useOrderBookStore.getState();
    expect(state.depth).toBe(25);
    expect(state.tickSize).toBe(0);
    expect(state.orderBooks).toEqual({});
  });

  it('setOrderBook stores an order book by symbol', () => {
    const ob = makeOrderBook('XBT/USD');
    useOrderBookStore.getState().setOrderBook(ob);
    const { orderBooks } = useOrderBookStore.getState();
    expect(orderBooks['XBT/USD']).toEqual(ob);
  });

  it('setOrderBook replaces an existing order book for the same symbol', () => {
    const ob1 = makeOrderBook('XBT/USD');
    const ob2: OrderBook = {
      ...makeOrderBook('XBT/USD'),
      bids: [{ price: 51000, quantity: 2.0 }],
      asks: [{ price: 51001, quantity: 1.0 }],
    };
    useOrderBookStore.getState().setOrderBook(ob1);
    useOrderBookStore.getState().setOrderBook(ob2);
    const { orderBooks } = useOrderBookStore.getState();
    expect(orderBooks['XBT/USD']).toEqual(ob2);
    expect(orderBooks['XBT/USD']?.bids[0].price).toBe(51000);
  });

  it('setDepth updates depth preference', () => {
    useOrderBookStore.getState().setDepth(50);
    expect(useOrderBookStore.getState().depth).toBe(50);

    useOrderBookStore.getState().setDepth(10);
    expect(useOrderBookStore.getState().depth).toBe(10);
  });

  it('setTickSize updates tickSize preference', () => {
    useOrderBookStore.getState().setTickSize(0.1);
    expect(useOrderBookStore.getState().tickSize).toBe(0.1);

    useOrderBookStore.getState().setTickSize(10);
    expect(useOrderBookStore.getState().tickSize).toBe(10);
  });

  it('migrate() falls back to defaults for missing stored values', async () => {
    localStorage.setItem(
      'fluxora-order-book-prefs',
      JSON.stringify({ state: {}, version: 0 }),
    );
    await useOrderBookStore.persist.rehydrate();
    const state = useOrderBookStore.getState();
    expect(state.depth).toBe(25);
    expect(state.tickSize).toBe(0);
  });

  it('migrate() falls back to defaults for invalid stored values (non-number depth)', async () => {
    localStorage.setItem(
      'fluxora-order-book-prefs',
      JSON.stringify({ state: { depth: 'bad', tickSize: null }, version: 0 }),
    );
    await useOrderBookStore.persist.rehydrate();
    const state = useOrderBookStore.getState();
    expect(state.depth).toBe(25);
    expect(state.tickSize).toBe(0);
  });
});
