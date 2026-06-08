import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './apps/web/src/**/*.{ts,tsx}',
    './packages/ui/src/**/*.{ts,tsx}',
    './packages/charts/src/**/*.{ts,tsx}',
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
