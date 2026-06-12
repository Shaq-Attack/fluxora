import { join } from 'path';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  // Anchor globs to this file — content paths resolve against the build cwd
  // (apps/web under Vite), where repo-root-relative globs match nothing
  content: [
    join(__dirname, 'apps/web/src/**/*.{ts,tsx}'),
    join(__dirname, 'packages/ui/src/**/*.{ts,tsx}'),
    join(__dirname, 'packages/charts/src/**/*.{ts,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          elevated: 'hsl(var(--surface-elevated))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          strong: 'hsl(var(--border-strong))',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
