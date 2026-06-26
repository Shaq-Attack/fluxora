import { useEffect } from 'react';
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
  const isFullscreen = useLayoutStore((s) => s.fullscreenPanelId === id);
  const setFullscreenPanel = useLayoutStore((s) => s.setFullscreenPanel);

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
