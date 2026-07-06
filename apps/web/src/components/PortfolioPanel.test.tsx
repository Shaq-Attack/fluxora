import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { usePaperTradingStore } from '../store/paperTradingStore';
import { PortfolioPanel } from './PortfolioPanel';

describe('PortfolioPanel', () => {
  beforeEach(() => {
    act(() => {
      usePaperTradingStore.setState({
        positions: {
          'XBT/USD': { symbol: 'XBT/USD', qty: 0.5, avgEntryPrice: 50000 },
        },
      });
    });
  });

  afterEach(() => {
    act(() => {
      usePaperTradingStore.setState({ positions: {}, pendingOrders: [] });
    });
  });

  it('root is a min-h-0 flex column so it can fill its grid share', () => {
    const { container } = render(<PortfolioPanel />);
    const root = container.firstElementChild;
    expect(root?.className).toContain('flex-col');
    expect(root?.className).toContain('min-h-0');
    expect(root?.className).toContain('flex-1');
  });

  it('positions region scrolls internally instead of growing the panel', () => {
    const { container } = render(<PortfolioPanel />);
    const scrollRegion = container.querySelector('.overflow-auto');
    expect(scrollRegion).not.toBeNull();
    expect(scrollRegion?.className).toContain('flex-1');
    expect(scrollRegion?.className).toContain('min-h-0');
  });
});
