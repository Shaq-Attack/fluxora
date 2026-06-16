import type { ReactNode } from 'react';
import { FullscreenToggleButton } from '@fluxora/ui';
import { useFullscreenPanel } from './useFullscreenPanel';

interface FullscreenPanelProps {
  id: string;
  children: ReactNode;
}

/**
 * Transparent wrapper that adds a floating fullscreen toggle to a panel. The
 * wrapped panel keeps its own frame and title; this only positions the toggle
 * and, when active, expands the panel to a full-viewport overlay.
 */
export function FullscreenPanel({ id, children }: FullscreenPanelProps): JSX.Element {
  const { isFullscreen, toggleFullscreen } = useFullscreenPanel(id);
  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 overflow-auto bg-surface p-3' : 'relative'}>
      {/* Fixed while fullscreen so the exit toggle stays viewport-anchored as content scrolls. */}
      <div className={isFullscreen ? 'fixed right-3 top-3 z-10' : 'absolute right-2 top-2 z-10'}>
        <FullscreenToggleButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
      </div>
      {children}
    </div>
  );
}
