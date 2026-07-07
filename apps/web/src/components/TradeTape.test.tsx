import { render, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import type { Trade } from '@fluxora/types';
import { useMarketStore } from '../store/marketStore';
import { TradeTape } from './TradeTape';

const SYMBOL = 'XBT/USD';

function makeTrade(id: number): Trade {
  return {
    id: String(id),
    symbol: SYMBOL,
    exchange: 'kraken',
    price: 50000 + id,
    quantity: 0.001,
    side: id % 2 === 0 ? 'buy' : 'sell',
    timestamp: Date.now() - id * 1000,
  };
}

describe('TradeTape', () => {
  beforeEach(() => {
    act(() => {
      useMarketStore.setState({
        trades: { [SYMBOL]: Array.from({ length: 20 }, (_, i) => makeTrade(i)) },
      });
    });
  });

  afterEach(() => {
    act(() => {
      useMarketStore.setState({ trades: {} });
    });
  });

  it('reserves a fixed base height so streaming trades cannot shift the layout', () => {
    const { container } = render(<TradeTape symbol={SYMBOL} />);
    const feed = container.querySelector('[data-testid="trade-tape-feed"]');
    expect(feed).not.toBeNull();
    // h-64 below lg: the panel occupies the same space before and after trades
    // arrive, so nothing below it moves. overflow-auto keeps growth internal.
    expect(feed?.className).toContain('h-64');
    expect(feed?.className).toContain('overflow-auto');
  });

  it('fills its flex share on large screens', () => {
    const { container } = render(<TradeTape symbol={SYMBOL} />);
    const feed = container.querySelector('[data-testid="trade-tape-feed"]');
    expect(feed?.className).toContain('lg:flex-1');
    expect(feed?.className).toContain('lg:min-h-0');
  });

  it('renders a loading skeleton while no trades have arrived', () => {
    act(() => {
      useMarketStore.setState({ trades: {} });
    });
    const { getByRole } = render(<TradeTape symbol={SYMBOL} />);
    expect(getByRole('status')).toBeDefined();
  });

  it('reserves the same base height in the skeleton state so the first trade cannot shift the layout', () => {
    act(() => {
      useMarketStore.setState({ trades: {} });
    });
    const { getByRole } = render(<TradeTape symbol={SYMBOL} />);
    const skeleton = getByRole('status');
    expect(skeleton.className).toContain('h-64');
    expect(skeleton.className).toContain('lg:flex-1');
  });
});
