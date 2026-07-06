# Viewport-Locked Dashboard Grid — Design

**Date:** 2026-07-06
**Status:** Approved

## Problem

The dashboard (`DashboardGrid`) is a single scrolling page where panels size to
their content. On large screens the right column stacks Chart (fixed 288px) →
Trades → Order Entry → Portfolio. The Trades panel renders as a small skeleton
on load, then grows to its 256px cap (`max-h-64`) as live trades stream in.
That growth pushes Order Entry and Portfolio down, and the column total
(~1100px+) exceeds a typical laptop viewport, so the Paper Trading Portfolio
panel ends up off screen.

Two distinct issues:

1. Layout shift when trades arrive (Trades panel grows after load).
2. The column is taller than the viewport, forcing page scroll.

## Decision

Adopt a **viewport-locked grid** at `lg+` (the approach used by Kraken Pro /
Binance): the dashboard fills exactly the viewport below the header, panels
receive proportional heights, and data-dense panels scroll internally. No page
scroll, no layout shift. This deliberately reverses the earlier "single
scrolling page, no per-panel scroll trapping" decision recorded in
`DashboardGrid.tsx` — keeping every panel on screen now takes priority.

Below `lg`, the current single-column, content-sized, page-scrolling behaviour
is retained: seven panels cannot fit a phone viewport.

## Layout

### Container

- `App.tsx` root: `min-h-screen` → `h-screen overflow-hidden`; the grid area
  becomes `flex-1 min-h-0` beneath the sticky header.
- `DashboardGrid`: at `lg+`, a two-column grid with `h-full` and no page
  scroll. Below `lg`, unchanged single-column scrolling page (the scroll
  container moves to the grid wrapper).
- Short-but-wide safety valve: the grid gets a `lg:min-h-[640px]` floor so on
  very short viewports the page scrolls instead of crushing panels.
- Tailwind-only responsive behaviour — no JS breakpoint logic (repo
  convention).

### Column sizing at `lg+`

| Column | Panel | Sizing | Internal scroll |
|--------|-------|--------|-----------------|
| Left | Watchlist | content-sized, `shrink-0` | no |
| Left | Ticker | content-sized, `shrink-0` | no |
| Left | Order Book | `flex-1 min-h-0` | yes |
| Right | Chart | `flex-[3] min-h-0` (replaces fixed `h-72` at lg) | n/a (chart fills) |
| Right | Trades | `flex-[2] min-h-0` (drops `max-h-64` cap) | yes |
| Right | Order Entry | content-sized, `shrink-0` | no |
| Right | Portfolio | `flex-[2] min-h-0` | yes |

## Component changes

- **`PanelShell` (`packages/ui`)**: gains a `fill` prop — root becomes
  `flex min-h-0 flex-1 flex-col` and the title bar is pinned with `shrink-0`.
  Scrolling stays with each panel's own content region (not the shell),
  because the trade-tape virtualiser must own its scroll element.
- **`FullscreenPanel`**: the non-fullscreen wrapper becomes a flex participant
  (`relative flex min-h-0 flex-col`) with a `className` prop for per-panel
  sizing; the fullscreen overlay becomes a flex column so fill-mode children
  fill it.
- **`TradeTape`**: the virtualised feed keeps a fixed `h-64` base below `lg`
  (reserved space — no layout shift on any screen size) and fills its flex
  share at `lg+` (`lg:h-auto lg:min-h-0 lg:flex-1`). The `fitContent` stacked
  variant is removed — nothing needs it any more.
- **`CandlestickChartPanel`**: chart body becomes `h-72 lg:h-auto lg:flex-1`
  with the panel root as a full-height flex column. Verify during
  implementation that `CandlestickChart` (lightweight-charts) resizes with its
  container; if it does not already observe resize, fix that as part of this
  work.
- **`OrderBookPanel` / `PortfolioPanel`**: bodies gain internal scroll when
  the allocated column share is insufficient.

## Error handling / edge cases

- Empty/skeleton states render inside the same fixed panel share — no layout
  shift between skeleton, empty, and populated states.
- Viewports shorter than the `lg:min-h` floor degrade to page scroll.
- Fullscreen toggle continues to expand any panel to a full-viewport overlay;
  `h-full` children now fill the overlay correctly.

## Testing

- Update `TradeTape` tests for the `fitContent` removal.
- Assert `PanelShell` fill mode renders the pinned title + scrollable body.
- Update `useFullscreenPanel` tests only if behaviour is touched.
- Manual verification via `pnpm dev` at 1440×900, 1920×1080, and a narrow
  window (single-column mode).

## Out of scope

- Draggable/resizable panel splits.
- Persisted user layout preferences.
- Any change to data flow, stores, or the order book worker.
