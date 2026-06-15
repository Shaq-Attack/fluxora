import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      toggleTheme: () =>
        set((s) => {
          const next = !s.isDark;
          document.documentElement.classList.toggle('dark', next);
          return { isDark: next };
        }),
    }),
    {
      name: 'fluxora-theme',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state !== undefined) {
          document.documentElement.classList.toggle('dark', state.isDark);
        }
      },
    },
  ),
);
