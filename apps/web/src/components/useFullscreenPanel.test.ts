import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, fireEvent } from '@testing-library/react';
import { useFullscreenPanel } from './useFullscreenPanel';
import { useLayoutStore } from '../store/layoutStore';

describe('useFullscreenPanel', () => {
  beforeEach(() => {
    useLayoutStore.setState({ orderEntrySide: 'buy', fullscreenPanelId: null });
  });

  it('isFullscreen is false initially for any panel id', () => {
    const { result } = renderHook(() => useFullscreenPanel('my-panel'));
    expect(result.current.isFullscreen).toBe(false);
  });

  it('toggleFullscreen sets this panel as fullscreen', () => {
    const { result } = renderHook(() => useFullscreenPanel('my-panel'));
    act(() => {
      result.current.toggleFullscreen();
    });
    expect(result.current.isFullscreen).toBe(true);
    expect(useLayoutStore.getState().fullscreenPanelId).toBe('my-panel');
  });

  it('toggleFullscreen clears fullscreen when already active', () => {
    const { result } = renderHook(() => useFullscreenPanel('my-panel'));
    act(() => {
      result.current.toggleFullscreen();
    });
    act(() => {
      result.current.toggleFullscreen();
    });
    expect(result.current.isFullscreen).toBe(false);
    expect(useLayoutStore.getState().fullscreenPanelId).toBeNull();
  });

  it('isFullscreen is false when a different panel is fullscreen', () => {
    const { result } = renderHook(() => useFullscreenPanel('my-panel'));
    act(() => {
      useLayoutStore.getState().setFullscreenPanel('other-panel');
    });
    expect(result.current.isFullscreen).toBe(false);
  });

  it('Escape key clears fullscreen', () => {
    const { result } = renderHook(() => useFullscreenPanel('my-panel'));
    act(() => {
      result.current.toggleFullscreen();
    });
    expect(result.current.isFullscreen).toBe(true);
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(result.current.isFullscreen).toBe(false);
    expect(useLayoutStore.getState().fullscreenPanelId).toBeNull();
  });

  it('Escape key does nothing when panel is not fullscreen', () => {
    renderHook(() => useFullscreenPanel('my-panel'));
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(useLayoutStore.getState().fullscreenPanelId).toBeNull();
  });
});
