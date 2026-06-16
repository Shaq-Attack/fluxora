import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLayoutStore } from '../store/layoutStore';

interface UseFullscreenPanelResult {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

/**
 * Tracks whether a given panel is the one currently expanded to fullscreen, and
 * exposes a toggle. Only one panel can be fullscreen at a time (a single id in
 * the layout store). While fullscreen, pressing Escape exits.
 */
export function useFullscreenPanel(id: string): UseFullscreenPanelResult {
  const { fullscreenPanelId, setFullscreenPanel } = useLayoutStore(
    useShallow((s) => ({
      fullscreenPanelId: s.fullscreenPanelId,
      setFullscreenPanel: s.setFullscreenPanel,
    })),
  );
  const isFullscreen = fullscreenPanelId === id;

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setFullscreenPanel(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setFullscreenPanel]);

  return {
    isFullscreen,
    toggleFullscreen: () => setFullscreenPanel(isFullscreen ? null : id),
  };
}
