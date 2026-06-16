import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_OUTER_LAYOUT: Record<string, number> = { sidebar: 25, main: 75 };
const DEFAULT_MAIN_LAYOUT: Record<string, number> = {
  chart: 40,
  'market-data': 20,
  'order-book': 25,
  trading: 15,
};

interface LayoutState {
  outerLayout: Record<string, number>;
  mainLayout: Record<string, number>;
  orderEntrySide: 'buy' | 'sell';
  // Ephemeral: id of the panel currently expanded to fullscreen, or null. Not persisted.
  fullscreenPanelId: string | null;
  setOuterLayout: (layout: Record<string, number>) => void;
  setMainLayout: (layout: Record<string, number>) => void;
  setOrderEntrySide: (side: 'buy' | 'sell') => void;
  setFullscreenPanel: (id: string | null) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      outerLayout: DEFAULT_OUTER_LAYOUT,
      mainLayout: DEFAULT_MAIN_LAYOUT,
      orderEntrySide: 'buy',
      fullscreenPanelId: null,
      setOuterLayout: (outerLayout) => set({ outerLayout }),
      setMainLayout: (mainLayout) => set({ mainLayout }),
      setOrderEntrySide: (orderEntrySide) => set({ orderEntrySide }),
      setFullscreenPanel: (fullscreenPanelId) => set({ fullscreenPanelId }),
    }),
    {
      name: 'fluxora-layout',
      version: 1,
      partialize: (state) => ({
        outerLayout: state.outerLayout,
        mainLayout: state.mainLayout,
      }),
      migrate: (stored: unknown) => {
        const s =
          typeof stored === 'object' && stored !== null
            ? (stored as Record<string, unknown>)
            : {};
        const isNumericRecord = (v: unknown): v is Record<string, number> =>
          typeof v === 'object' &&
          v !== null &&
          !Array.isArray(v) &&
          Object.values(v).every((x) => typeof x === 'number');
        const outer = isNumericRecord(s.outerLayout) ? s.outerLayout : DEFAULT_OUTER_LAYOUT;
        const main = isNumericRecord(s.mainLayout) ? s.mainLayout : DEFAULT_MAIN_LAYOUT;
        return { outerLayout: outer, mainLayout: main };
      },
    },
  ),
);
