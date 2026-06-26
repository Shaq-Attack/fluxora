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

  it('fitContent: trade list has overflow-auto so the panel height is bounded', () => {
    const { container } = render(<TradeTape symbol={SYMBOL} fitContent />);
    // The scrollable list container must carry overflow-auto so the panel cannot
    // grow to unbounded height as trades accumulate.
    const scrollableList = container.querySelector('.overflow-auto');
    expect(scrollableList).not.toBeNull();
  });

  it('fitContent: trade list has a max-height cap', () => {
    const { container } = render(<TradeTape symbol={SYMBOL} fitContent />);
    // Without a max-h-* class, the panel grows to ~1 280 px (40 rows × 32 px)
    // and pushes all panels below it off-screen.
    const listEl = container.querySelector('[class*="max-h-"]');
    expect(listEl).not.toBeNull();
  });

  it('default (virtualised) mode still renders scrollable container', () => {
    const { container } = render(<TradeTape symbol={SYMBOL} />);
    const scrollableContainer = container.querySelector('[data-testid="trade-tape-feed"]');
    expect(scrollableContainer).not.toBeNull();
  });
});
