# Fluxora

A portfolio-grade cryptocurrency trading dashboard — live order books, candlestick charts, and paper trading, powered by real-time WebSocket feeds from Kraken, Binance, and Coinbase.

## Getting Started

```bash
pnpm install
pnpm dev
```

Requires Node 20+ and pnpm 9+.

## Workspace Structure

```
apps/
  web/          Main React application (Vite + SWC)
packages/
  types/        Shared TypeScript types (Exchange, OrderBook, Ticker, Candle, Trade)
  data/         Exchange adapters — WebSocket hooks and REST clients
  worker/       Order book engine (Web Worker, snapshot + delta processing)
  ui/           Design system components (Storybook)
  charts/       TradingView Lightweight Charts and ECharts wrappers
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Type-check + production build |
| `pnpm lint` | ESLint across all packages |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm format` | Prettier across all packages |
| `pnpm type-check` | TypeScript project-reference build |
| `pnpm test` | Vitest unit tests |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm storybook` | Launch Storybook for `@fluxora/ui` |

## Capabilities

- Monorepo scaffold with pnpm workspaces and TypeScript project references
