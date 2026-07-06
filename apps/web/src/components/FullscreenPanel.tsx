import type { ReactNode } from 'react';
import { FullscreenToggleButton } from '@fluxora/ui';
import { useFullscreenPanel } from './useFullscreenPanel';

interface FullscreenPanelProps {
  id: string;
  children: ReactNode;
  /** Sizing classes for the non-fullscreen wrapper (e.g. shrink-0, lg:flex-1). */
  className?: string;
}

/**
 * Transparent wrapper that adds a floating fullscreen toggle to a panel. The
 * wrapped panel keeps its own frame and title; this only positions the toggle
 * and, when active, expands the panel to a full-viewport overlay. The wrapper
 * is a min-h-0 flex column so column height flows through to the panel.
 */
export function FullscreenPanel({ id, children, className = '' }: FullscreenPanelProps): JSX.Element {
  const { isFullscreen, toggleFullscreen } = useFullscreenPanel(id);
  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-auto bg-surface p-3'
          : `relative flex min-h-0 flex-col ${className}`
      }
    >
      {/* Fixed while fullscreen so the exit toggle stays viewport-anchored as content scrolls. */}
      <div className={isFullscreen ? 'fixed right-3 top-3 z-30' : 'absolute right-2 top-2 z-30'}>
        <FullscreenToggleButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
      </div>
      {children}
    </div>
  );
}
