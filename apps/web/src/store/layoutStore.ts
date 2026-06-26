import { create } from 'zustand';

interface LayoutState {
  orderEntrySide: 'buy' | 'sell';
  // Ephemeral: id of the panel currently expanded to fullscreen, or null. Not persisted.
  fullscreenPanelId: string | null;
  setOrderEntrySide: (side: 'buy' | 'sell') => void;
  setFullscreenPanel: (id: string | null) => void;
}

export const useLayoutStore = create<LayoutState>()((set) => ({
  orderEntrySide: 'buy',
  fullscreenPanelId: null,
  setOrderEntrySide: (orderEntrySide) => set({ orderEntrySide }),
  setFullscreenPanel: (fullscreenPanelId) => set({ fullscreenPanelId }),
}));
