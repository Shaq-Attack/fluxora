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
        // `<alpha-value>` lets opacity modifiers (bg-surface/60, border-border/50) work
        surface: {
          DEFAULT: 'hsl(var(--surface) / <alpha-value>)',
          elevated: 'hsl(var(--surface-elevated) / <alpha-value>)',
          strong: 'hsl(var(--surface-strong) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'hsl(var(--border) / <alpha-value>)',
          strong: 'hsl(var(--border-strong) / <alpha-value>)',
        },
        primary: 'hsl(var(--text-primary) / <alpha-value>)',
        muted: 'hsl(var(--text-muted) / <alpha-value>)',
        dim: 'hsl(var(--text-dim) / <alpha-value>)',
        subtle: 'hsl(var(--text-subtle) / <alpha-value>)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        // Price-tick flash: green-400 / red-400 washes that decay to transparent
        'flash-up': {
          '0%': { backgroundColor: 'rgb(74 222 128 / 0.30)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'flash-down': {
          '0%': { backgroundColor: 'rgb(248 113 113 / 0.30)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'flash-up': 'flash-up 600ms ease-out',
        'flash-down': 'flash-down 600ms ease-out',
        'toast-in': 'toast-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
