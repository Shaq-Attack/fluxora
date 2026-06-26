import { describe, it, expect, beforeEach } from 'vitest';
import { useWatchlistStore } from './watchlistStore';

describe('useWatchlistStore', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ watchlist: ['BTC/USD', 'ETH/USD'] });
  });

  it('starts with BTC/USD and ETH/USD', () => {
    const { watchlist } = useWatchlistStore.getState();
    expect(watchlist).toEqual(['BTC/USD', 'ETH/USD']);
  });

  it('addSymbol appends a new symbol', () => {
    const { addSymbol } = useWatchlistStore.getState();
    addSymbol('XRP/USD');
    const { watchlist } = useWatchlistStore.getState();
    expect(watchlist).toEqual(['BTC/USD', 'ETH/USD', 'XRP/USD']);
  });

  it('addSymbol is idempotent for duplicate symbols', () => {
    const { addSymbol } = useWatchlistStore.getState();
    addSymbol('BTC/USD');
    const { watchlist } = useWatchlistStore.getState();
    expect(watchlist).toEqual(['BTC/USD', 'ETH/USD']);
  });

  it('removeSymbol removes an existing symbol', () => {
    const { removeSymbol } = useWatchlistStore.getState();
    removeSymbol('ETH/USD');
    const { watchlist } = useWatchlistStore.getState();
    expect(watchlist).toEqual(['BTC/USD']);
  });

  it('removeSymbol is a no-op for a non-existent symbol', () => {
    const { removeSymbol } = useWatchlistStore.getState();
    removeSymbol('DOGE/USD');
    const { watchlist } = useWatchlistStore.getState();
    expect(watchlist).toEqual(['BTC/USD', 'ETH/USD']);
  });
});
