import { render, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import type { Ticker } from '@fluxora/types';
import { useMarketStore } from '../store/marketStore';
import { OrderEntryPanel } from './OrderEntryPanel';

const SYMBOL = 'XBT/USD';

function makeTicker(): Ticker {
  return {
    symbol: SYMBOL,
    exchange: 'kraken',
    bid: 49999,
    ask: 50001,
    price: 50000,
    volume24h: 1234.5,
    change24h: 100,
    changePercent24h: 0.2,
    timestamp: Date.now(),
  };
}

describe('OrderEntryPanel', () => {
  beforeEach(() => {
    act(() => {
      useMarketStore.setState({ tickers: {} });
    });
  });

  afterEach(() => {
    act(() => {
      useMarketStore.setState({ tickers: {} });
    });
  });

  it('reserves the quick-fill and info line space while no ticker has arrived', () => {
    const { getByText, container } = render(<OrderEntryPanel symbol={SYMBOL} />);

    const quickFillButton = getByText('25%');
    expect(quickFillButton).not.toBeNull();
    expect((quickFillButton as HTMLButtonElement).disabled).toBe(true);

    const infoLine = container.querySelector('p');
    expect(infoLine).not.toBeNull();
    expect(infoLine?.textContent).toContain('Last:');
    expect(infoLine?.textContent).toContain('—');
  });

  it('enables the quick-fill row and shows a formatted price once a ticker arrives', () => {
    act(() => {
      useMarketStore.setState({ tickers: { [SYMBOL]: makeTicker() } });
    });

    const { getByText, container } = render(<OrderEntryPanel symbol={SYMBOL} />);

    const quickFillButton = getByText('25%');
    expect((quickFillButton as HTMLButtonElement).disabled).toBe(false);

    const infoLine = container.querySelector('p');
    expect(infoLine?.textContent).toContain('Last:');
    expect(infoLine?.textContent).toContain('50,000.00');
  });
});
