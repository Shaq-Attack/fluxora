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
- **Live market data dashboard** — streams BTC/USD and ETH/USD in real time from Kraken WebSocket v2
  - Ticker panel: best bid, best ask, and last price with sub-200 ms updates
  - Trade tape: live matched orders with timestamp, price, size, and side colouring (green buy / red sell), virtualised via `@tanstack/react-virtual` for high throughput
  - Connection badge: visible Live / Connecting / Disconnected indicator with exponential-backoff auto-reconnect
- **Live order book panel** — streams Kraken `book` channel for BTC/USD and ETH/USD
  - Bid and ask grids showing top 10 levels with colour-coded prices (green bids / red asks)
  - Cumulative depth bars on each row showing relative liquidity at a glance
  - Backed by an off-thread Web Worker that processes snapshots and incremental deltas
  - CRC32 checksum validation (Kraken spec) and sequence-gap detection, with automatic REST re-sync on mismatch
- **Live candlestick chart** — 1-minute OHLC chart per symbol powered by TradingView Lightweight Charts
  - 200+ historical bars fetched from Kraken REST on mount (cached 60 s via TanStack Query)
  - In-progress and completed bars stream in real time from the Kraken `ohlc` WebSocket channel
  - Partial (in-progress) candle updates correctly update the last bar rather than appending a duplicate
  - Supports zoom and pan; current price tracked on the price scale
