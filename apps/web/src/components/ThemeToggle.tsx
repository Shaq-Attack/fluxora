import { ThemeToggle as BaseToggle } from '@fluxora/ui';
import { useThemeStore } from '../store/themeStore';

export function ThemeToggle(): JSX.Element {
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  return <BaseToggle isDark={isDark} onToggle={toggleTheme} />;
}
