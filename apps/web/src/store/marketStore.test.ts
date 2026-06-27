import { describe, it, expect, beforeEach } from 'vitest';
import type { Ticker, Trade } from '@fluxora/types';
import { useMarketStore } from './marketStore';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeTicker(symbol: string, overrides?: Partial<Ticker>): Ticker {
  return {
    symbol,
    exchange: 'kraken',
    bid: 29_990,
    ask: 30_010,
    price: 30_000,
    volume24h: 1_000,
    change24h: 100,
    changePercent24h: 0.33,
    timestamp: 1_700_000_000_000,
    ...overrides,
  };
}

function makeTrade(symbol: string, id: number, overrides?: Partial<Trade>): Trade {
  return {
    id: String(id),
    symbol,
    exchange: 'kraken',
    price: 30_000 + id,
    quantity: 0.001,
    side: id % 2 === 0 ? 'buy' : 'sell',
    timestamp: 1_700_000_000_000 + id,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMarketStore', () => {
  beforeEach(() => {
    useMarketStore.setState({
      tickers: {},
      trades: {},
      connectionStatus: 'disconnected',
      activeSymbol: 'BTC/USD',
    });
  });

  // Initial state
  it('starts empty with disconnected status and BTC/USD active symbol', () => {
    const state = useMarketStore.getState();
    expect(state.tickers).toEqual({});
    expect(state.trades).toEqual({});
    expect(state.connectionStatus).toBe('disconnected');
    expect(state.activeSymbol).toBe('BTC/USD');
  });

  // setTickers
  it('batches an array of tickers into the map by symbol', () => {
    const { setTickers } = useMarketStore.getState();
    const btc = makeTicker('BTC/USD');
    const eth = makeTicker('ETH/USD');
    setTickers([btc, eth]);
    const { tickers } = useMarketStore.getState();
    expect(tickers['BTC/USD']).toEqual(btc);
    expect(tickers['ETH/USD']).toEqual(eth);
  });

  it('merges new tickers without removing existing symbols', () => {
    const { setTickers } = useMarketStore.getState();
    const btc = makeTicker('BTC/USD');
    setTickers([btc]);
    const eth = makeTicker('ETH/USD');
    setTickers([eth]);
    const { tickers } = useMarketStore.getState();
    expect(tickers['BTC/USD']).toEqual(btc);
    expect(tickers['ETH/USD']).toEqual(eth);
  });

  // addTrades
  it('stores trades newest-first (reverses the incoming array)', () => {
    const { addTrades } = useMarketStore.getState();
    // Send trades in ascending-id (oldest-first) order
    addTrades([makeTrade('BTC/USD', 1), makeTrade('BTC/USD', 2), makeTrade('BTC/USD', 3)]);
    const stored = useMarketStore.getState().trades['BTC/USD'];
    expect(stored).toBeDefined();
    if (!stored) return;
    // After reversal, the trade with id=3 should be at index 0
    expect(stored[0].id).toBe('3');
  });

  it('prepends new trades to existing for the same symbol', () => {
    const { addTrades } = useMarketStore.getState();
    addTrades([makeTrade('BTC/USD', 1)]);
    addTrades([makeTrade('BTC/USD', 2)]);
    const stored = useMarketStore.getState().trades['BTC/USD'];
    expect(stored).toBeDefined();
    if (!stored) return;
    // Most-recent batch (id=2) reversed is just [id=2], prepended before [id=1]
    expect(stored[0].id).toBe('2');
    expect(stored[1].id).toBe('1');
  });

  it('caps the trade list at 500 per symbol', () => {
    const { addTrades } = useMarketStore.getState();
    // First batch of 300
    addTrades(Array.from({ length: 300 }, (_, i) => makeTrade('BTC/USD', i)));
    // Second batch of 201 — total attempted: 501
    addTrades(Array.from({ length: 201 }, (_, i) => makeTrade('BTC/USD', 300 + i)));
    const stored = useMarketStore.getState().trades['BTC/USD'];
    expect(stored).toBeDefined();
    if (!stored) return;
    expect(stored.length).toBe(500);
  });

  it('handles trades for multiple symbols in one call atomically', () => {
    const { addTrades } = useMarketStore.getState();
    addTrades([
      makeTrade('BTC/USD', 1),
      makeTrade('ETH/USD', 2),
      makeTrade('BTC/USD', 3),
    ]);
    const { trades } = useMarketStore.getState();
    expect(trades['BTC/USD']?.length).toBe(2);
    expect(trades['ETH/USD']?.length).toBe(1);
  });

  // setConnectionStatus
  it('updates connection status', () => {
    const { setConnectionStatus } = useMarketStore.getState();
    setConnectionStatus('connected');
    expect(useMarketStore.getState().connectionStatus).toBe('connected');
    setConnectionStatus('error');
    expect(useMarketStore.getState().connectionStatus).toBe('error');
  });

  // setActiveSymbol
  it('updates active symbol', () => {
    const { setActiveSymbol } = useMarketStore.getState();
    setActiveSymbol('ETH/USD');
    expect(useMarketStore.getState().activeSymbol).toBe('ETH/USD');
  });
});
