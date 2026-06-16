# Fluxora

A portfolio-grade cryptocurrency trading dashboard — live order books, candlestick charts, and paper trading, powered by real-time WebSocket feeds from Kraken, Binance, and Coinbase.

## Getting Started

```bash
pnpm install
pnpm dev
```

Requires Node 20+ and pnpm 9+.

To enable error tracking and performance monitoring, copy `.env.example` to `.env` and set
`VITE_SENTRY_DSN` to your Sentry project DSN. When the DSN is unset, Sentry is disabled and the
app runs normally.

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
  - Bid and ask grids with colour-coded prices (green bids / red asks) and cumulative depth bars on each row
  - **Depth selector** — choose 10, 25, or 50 visible levels; changing depth resubscribes the worker and reconnects the WebSocket with the new depth immediately
  - **Tick aggregation** — group price levels into $0.10, $1, or $10 buckets; quantities within each bucket are summed and the bucket floor price is shown; CRC32 checksum validation is automatically suspended while aggregation is active
  - Depth and tick-size preferences persisted to `localStorage` and restored on page reload
  - Backed by an off-thread Web Worker that processes snapshots and incremental deltas
  - CRC32 checksum validation (Kraken spec) and sequence-gap detection, with automatic REST re-sync on mismatch
- **Advanced candlestick chart** — multi-timeframe OHLC chart with technical overlays, powered by TradingView Lightweight Charts
  - Timeframe selector: switch between 1m, 5m, 15m, and 1h bars; chart reloads with the appropriate Kraken OHLC data
  - VWAP overlay: cumulative volume-weighted average price rendered as a purple line, toggled on/off per chart
  - EMA(9) overlay: 9-period exponential moving average rendered as an amber line, toggled on/off per chart
  - Crosshair price and timestamp labels on hover (TradingView native crosshair mode)
  - Sliding window cap: last 500 bars kept in memory; older bars are dropped as new ones arrive
  - Historical bars fetched from Kraken REST on mount and symbol/timeframe switch (cached 60 s via TanStack Query)
  - In-progress and completed bars stream in real time from the Kraken `ohlc` WebSocket channel
  - Supports zoom and pan; current price tracked on the price scale
- **Paper trading** — simulated order entry and portfolio tracking using live Kraken prices, with no real funds involved
  - Order entry panel per symbol: market and limit orders, buy or sell, with quantity input and quick-fill buttons (25 / 50 / 75 / 100% of available balance or position)
  - Limit orders stored as pending and auto-executed when the live market price crosses the limit price
  - Portfolio panel: cash balance, per-symbol holdings with average entry price, current value, and unrealised PnL updated in real time as prices change
  - Starting paper balance: $10,000 USD; portfolio state persisted across page reloads via `localStorage`
- **Resizable multi-panel layout** — drag-to-resize panel dividers let users adjust every panel to their preferred proportions
  - Horizontal divider between the watchlist sidebar and the main content area
  - Three vertical dividers within the main area: chart / market-data / order-book / trading sections
  - Panel size ratios persisted to `localStorage` via Zustand and restored on page reload
  - Keyboard shortcuts: press **B** to pre-select Buy or **S** to pre-select Sell in the order entry panel (shortcuts are suppressed when a text input is focused)
  - Panels maintain their proportional sizes on window resize — no overflow or hidden content
- **Watchlist & symbol switching** — persistent watchlist panel and single-symbol trading view
  - Watchlist panel shows each symbol's last price and 24h change, updating in real time from the Kraken ticker feed
  - Click any watchlist row to switch the chart, order book, trade tape, and order entry to that symbol instantly
  - Add and remove symbols via the input at the bottom of the panel; watchlist state persisted to `localStorage` across page reloads
  - Dashboard layout: watchlist sidebar (left) + active-symbol panels (right)
- **Dark / light theme toggle** — runtime theme switching with no page reload and no flash on load
  - Toggle button in the app header switches all panels between dark and light modes instantly
  - Selected theme persisted to `localStorage` and restored on next visit; an inline script in `index.html` applies the saved class before React renders, eliminating the flash of wrong theme
  - All panels use semantic design tokens (`bg-surface`, `text-primary`, `text-muted`, `border`) rather than hardcoded Tailwind grays, so both themes render correctly without per-component `dark:` overrides
  - Five design-system primitives (`ThemeToggle`, `Badge`, `PanelShell`, `StatDisplay`, `PriceChange`) documented in Storybook with both theme variants; run `pnpm storybook` to browse
- **Observability** — Sentry error tracking and performance monitoring plus custom runtime metrics
  - Sentry SDK initialised at startup (reads `VITE_SENTRY_DSN`); unhandled errors and promise rejections are captured automatically
  - Each main panel (chart, order book, trade tape, order entry, portfolio) is wrapped in a React error boundary that reports the crash to Sentry and shows a retry fallback instead of taking down the dashboard
  - WebSocket round-trip latency measured via Kraken ping/pong and reported to Sentry as a custom measurement
  - Core Web Vitals (CLS, LCP, INP) collected with the `web-vitals` package and reported to Sentry Performance
  - Lightweight FPS monitor warns in the console when the frame rate drops below 30 FPS
- **Data caching layer** — all REST calls go through a shared TanStack Query client
  - `QueryClient` configured with `staleTime: 10 s`, `retry: 2`, and `refetchOnWindowFocus: false`
  - Typed query hooks for all three Kraken REST domains: candles (`useKrakenCandles`), ticker snapshot (`useKrakenTickerSnapshot`), and order-book depth snapshot (`useKrakenDepthSnapshot`)
  - Query key convention `[exchange, symbol, dataType, ...extras]` enforced across all hooks
  - Previous data served instantly on symbol-switch (`placeholderData: keepPreviousData`) — no blank states
  - Every hook exposes `error` and `isError` for caller-controlled error display
