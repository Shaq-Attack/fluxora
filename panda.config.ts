import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Disable Panda's preflight — Tailwind handles base styles
  preflight: false,

  include: [
    './apps/web/src/**/*.{ts,tsx}',
    './packages/ui/src/**/*.{ts,tsx}',
  ],
  exclude: [],

  theme: {
    extend: {
      semanticTokens: {
        colors: {
          bg: {
            primary: { value: { base: '{colors.white}', _dark: '#0a0a0f' } },
            secondary: { value: { base: '#f8fafc', _dark: '#111118' } },
            surface: { value: { base: '{colors.white}', _dark: '#1a1a24' } },
          },
          text: {
            primary: { value: { base: '#0f172a', _dark: '#f8fafc' } },
            muted: { value: { base: '#64748b', _dark: '#94a3b8' } },
          },
          border: {
            default: { value: { base: '#e2e8f0', _dark: '#2d2d3a' } },
          },
          bid: {
            DEFAULT: { value: '#22c55e' },
            muted: { value: 'color-mix(in srgb, #22c55e 15%, transparent)' },
          },
          ask: {
            DEFAULT: { value: '#ef4444' },
            muted: { value: 'color-mix(in srgb, #ef4444 15%, transparent)' },
          },
        },
      },
    },
  },

  outdir: 'styled-system',
});
