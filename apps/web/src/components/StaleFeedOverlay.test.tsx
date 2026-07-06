import { render, act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useMarketStore } from '../store/marketStore';
import { StaleFeedOverlay } from './StaleFeedOverlay';

describe('StaleFeedOverlay', () => {
  afterEach(() => {
    act(() => {
      useMarketStore.setState({ connectionStatus: 'disconnected' });
    });
  });

  it('renders nothing while the feed is connected', () => {
    act(() => {
      useMarketStore.setState({ connectionStatus: 'connected' });
    });
    const { container } = render(<StaleFeedOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the stale chip when the feed is disconnected', () => {
    act(() => {
      useMarketStore.setState({ connectionStatus: 'disconnected' });
    });
    const { getByText } = render(<StaleFeedOverlay />);
    expect(getByText(/Stale — reconnecting/)).not.toBeNull();
  });
});
