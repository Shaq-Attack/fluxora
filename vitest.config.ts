import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['apps/**/*.test.{ts,tsx}', 'packages/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
    alias: {
      '@fluxora/ui': resolve(__dirname, 'packages/ui/src'),
      '@fluxora/data': resolve(__dirname, 'packages/data/src'),
      '@fluxora/worker': resolve(__dirname, 'packages/worker/src'),
      '@fluxora/types': resolve(__dirname, 'packages/types/src'),
      '@fluxora/charts': resolve(__dirname, 'packages/charts/src'),
    },
  },
});
