import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './themeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    // Reset store state to dark mode
    useThemeStore.setState({ isDark: true });
    // Reset DOM classes to match initial state
    document.documentElement.classList.add('dark');
  });

  it('starts as dark by default', () => {
    const state = useThemeStore.getState();
    expect(state.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggleTheme switches to light and removes dark class', () => {
    const state = useThemeStore.getState();
    state.toggleTheme();

    const newState = useThemeStore.getState();
    expect(newState.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggleTheme switches back to dark and adds dark class', () => {
    const state = useThemeStore.getState();
    state.toggleTheme();
    state.toggleTheme();

    const newState = useThemeStore.getState();
    expect(newState.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
