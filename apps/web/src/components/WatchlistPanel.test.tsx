import { render, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWatchlistStore } from '../store/watchlistStore';
import { WatchlistPanel } from './WatchlistPanel';

const { isKrakenPairSupported } = vi.hoisted(() => ({
  isKrakenPairSupported: vi.fn(),
}));

vi.mock('@fluxora/data', () => ({ isKrakenPairSupported }));

describe('WatchlistPanel', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ watchlist: ['BTC/USD', 'ETH/USD'] });
    isKrakenPairSupported.mockReset();
  });

  it('shows an error and does not add the symbol when Kraken does not support the pair', async () => {
    isKrakenPairSupported.mockResolvedValue(false);
    const { getByLabelText, getByText, findByText, queryByText } = render(<WatchlistPanel />);

    fireEvent.change(getByLabelText('Symbol to add'), { target: { value: 'BTC/ZAR' } });
    fireEvent.click(getByText('Add'));

    expect(await findByText('BTC/ZAR is not a supported pair at this time.')).not.toBeNull();
    expect(queryByText('BTC/ZAR')).toBeNull();
    expect(useWatchlistStore.getState().watchlist).toEqual(['BTC/USD', 'ETH/USD']);
  });

  it('adds the symbol and clears the input when Kraken supports the pair', async () => {
    isKrakenPairSupported.mockResolvedValue(true);
    const { getByLabelText, getByText, findByText } = render(<WatchlistPanel />);

    const input = getByLabelText('Symbol to add') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'SOL/USD' } });
    fireEvent.click(getByText('Add'));

    expect(await findByText('SOL/USD')).not.toBeNull();
    expect(input.value).toBe('');
    expect(useWatchlistStore.getState().watchlist).toEqual(['BTC/USD', 'ETH/USD', 'SOL/USD']);
  });

  it('disables the Add button while the pair is being validated', async () => {
    let resolveValidation: (value: boolean) => void = () => {};
    isKrakenPairSupported.mockReturnValue(
      new Promise((resolve) => {
        resolveValidation = resolve;
      }),
    );
    const { getByLabelText, getByText, findByText, queryByText } = render(<WatchlistPanel />);

    const input = getByLabelText('Symbol to add') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'SOL/USD' } });
    fireEvent.click(getByText('Add'));

    // Still pending: input not yet cleared, row not yet added, button disabled.
    expect(input.value).toBe('SOL/USD');
    expect(queryByText('SOL/USD')).toBeNull();
    expect((getByText('Add') as HTMLButtonElement).disabled).toBe(true);

    act(() => {
      resolveValidation(true);
    });
    expect(await findByText('SOL/USD')).not.toBeNull();
  });
});
