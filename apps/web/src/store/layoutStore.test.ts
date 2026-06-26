import { describe, it, expect, beforeEach } from 'vitest';
import { useLayoutStore } from './layoutStore';

describe('useLayoutStore', () => {
  beforeEach(() => {
    useLayoutStore.setState({ orderEntrySide: 'buy', fullscreenPanelId: null });
  });

  it('starts with buy side and no fullscreen panel', () => {
    const state = useLayoutStore.getState();
    expect(state.orderEntrySide).toBe('buy');
    expect(state.fullscreenPanelId).toBeNull();
  });

  it('setOrderEntrySide changes to sell', () => {
    const { setOrderEntrySide } = useLayoutStore.getState();
    setOrderEntrySide('sell');
    const state = useLayoutStore.getState();
    expect(state.orderEntrySide).toBe('sell');
  });

  it('setOrderEntrySide changes back to buy', () => {
    const { setOrderEntrySide } = useLayoutStore.getState();
    setOrderEntrySide('sell');
    setOrderEntrySide('buy');
    const state = useLayoutStore.getState();
    expect(state.orderEntrySide).toBe('buy');
  });

  it('setFullscreenPanel sets a panel id', () => {
    const { setFullscreenPanel } = useLayoutStore.getState();
    setFullscreenPanel('order-book');
    const state = useLayoutStore.getState();
    expect(state.fullscreenPanelId).toBe('order-book');
  });

  it('setFullscreenPanel clears with null', () => {
    const { setFullscreenPanel } = useLayoutStore.getState();
    setFullscreenPanel('ticker');
    setFullscreenPanel(null);
    const state = useLayoutStore.getState();
    expect(state.fullscreenPanelId).toBeNull();
  });

  it('setFullscreenPanel replaces an existing id', () => {
    const { setFullscreenPanel } = useLayoutStore.getState();
    setFullscreenPanel('portfolio');
    setFullscreenPanel('trade-tape');
    const state = useLayoutStore.getState();
    expect(state.fullscreenPanelId).toBe('trade-tape');
  });
});
