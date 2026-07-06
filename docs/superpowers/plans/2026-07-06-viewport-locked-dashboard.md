# Viewport-Locked Dashboard Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the dashboard to the viewport at `lg+` so every panel stays on screen — no page scroll, no layout shift when the Trades feed streams in.

**Architecture:** The app root becomes `h-screen overflow-hidden` with a scrollable `<main>` region. At `lg+` the two-column grid fills that region exactly (`h-full`); data-dense panels (Order Book, Trades, Portfolio) receive proportional flex shares and scroll internally. Below `lg` the current single-column, content-sized, page-scrolling layout is retained. `PanelShell` gains a `fill` mode and `FullscreenPanel` passes height through so column height reaches panel content.

**Tech Stack:** React 18 + TypeScript (strict), Tailwind CSS, Zustand, @tanstack/react-virtual, Vitest + React Testing Library, Storybook.

**Spec:** `docs/superpowers/specs/2026-07-06-viewport-locked-dashboard-design.md`

## Global Constraints

- Tailwind-only responsive behaviour — **no JS breakpoint logic** (repo convention, `DashboardGrid` doc comment).
- No inline `style={{}}` except the two documented exemptions (virtualiser positioning, order-book depth-bar width) — see root `CLAUDE.md` "Styling Exceptions".
- TypeScript strict mode; `pnpm type-check` must stay clean after every task.
- Tests run from the **repo root**: `pnpm test -- <path-filter>` (Vitest, not Jest — the root `CLAUDE.md` command reference is outdated on this point).
- **The working tree has unrelated in-flight changes** (toast/skeleton work touching `TradeTape.tsx`, `OrderEntryPanel.tsx`, and others). Do NOT create a fresh worktree (it would lose that uncommitted context) and NEVER use `git add -A` / `git add .` — stage only the exact files listed in each task's commit step.
- Per root `CLAUDE.md`, run `codacy_cli_analyze` from the Codacy MCP Server after every file edit **if that MCP server is connected**; if it is not available in the session, note that in the final report.

### Height-chain primer (read before any task)

For a child to fill a fixed-height flex column, every ancestor in the chain needs
`min-h-0` (flex items default to `min-height: auto`, which blocks shrinking) and
the child needs `flex-1`. Below `lg` the columns have no fixed height, so
`flex-1` items simply size to content — that is what preserves the mobile
behaviour without breakpoint JS. The one exception is the Trades feed, which
keeps a fixed `h-64` base height below `lg` so streaming trades can never grow
the panel (this also fixes the layout-shift bug on mobile).

---

### Task 1: PanelShell fill mode (`@fluxora/ui`)

**Files:**
- Modify: `packages/ui/src/components/PanelShell.tsx`
- Create: `packages/ui/src/components/PanelShell.test.tsx`
- Modify: `packages/ui/src/stories/PanelShell.stories.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `PanelShell` prop `fill?: boolean` (default `false`). When `true`, the root gets `flex min-h-0 flex-1 flex-col` so the panel fills its flex-column parent, and the title bar is pinned with `shrink-0`. Children are NOT wrapped in a scroll region — each panel owns its scroll container (the trade-tape virtualiser must own its own scroll element, so scrolling cannot live in the shell).

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/PanelShell.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PanelShell } from './PanelShell';

describe('PanelShell', () => {
  it('is content-sized by default (no flex fill classes)', () => {
    const { container } = render(
      <PanelShell title="T">
        <p>body</p>
      </PanelShell>,
    );
    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    expect(root?.className).not.toContain('flex-1');
  });

  it('fill mode makes the root a min-h-0 flex column so it fills its grid share', () => {
    const { container } = render(
      <PanelShell fill title="T">
        <p>body</p>
      </PanelShell>,
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain('flex-1');
    expect(root?.className).toContain('min-h-0');
    expect(root?.className).toContain('flex-col');
  });

  it('pins the title bar with shrink-0 so scrolling content cannot crush it', () => {
    const { getByText } = render(
      <PanelShell fill title="Order Book">
        <p>body</p>
      </PanelShell>,
    );
    const titleBar = getByText('Order Book').parentElement;
    expect(titleBar?.className).toContain('shrink-0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- packages/ui/src/components/PanelShell.test.tsx`
Expected: FAIL — the `fill` prop does not exist yet, so the fill-mode and shrink-0 assertions fail (TS may also error on the unknown prop; that counts as the failing state).

- [ ] **Step 3: Implement fill mode**

Replace the body of `packages/ui/src/components/PanelShell.tsx` with:

```tsx
import type { ReactNode } from 'react';

interface PanelShellProps {
  title?: string;
  children: ReactNode;
  className?: string;
  /** Fill the parent flex column (min-h-0 flex-1) instead of sizing to content. */
  fill?: boolean;
}

export function PanelShell({
  title,
  children,
  className = '',
  fill = false,
}: PanelShellProps): JSX.Element {
  const fillClasses = fill ? 'flex min-h-0 flex-1 flex-col ' : '';
  return (
    <div className={`rounded-lg border border-border bg-surface-elevated ${fillClasses}${className}`}>
      {title !== undefined && (
        <div className="shrink-0 border-b border-border px-3 py-2">
          <h2 className="text-sm font-semibold text-muted">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- packages/ui/src/components/PanelShell.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Add a Storybook story for fill mode**

Append to `packages/ui/src/stories/PanelShell.stories.tsx`:

```tsx
export const Fill: Story = {
  render: () => (
    <div className="flex h-64 flex-col">
      <PanelShell fill title="Filled Panel">
        <div className="min-h-0 flex-1 overflow-auto p-3">
          {Array.from({ length: 40 }, (_, i) => (
            <p key={i} className="text-sm text-dim">
              Row {i + 1}
            </p>
          ))}
        </div>
      </PanelShell>
    </div>
  ),
};
```

- [ ] **Step 6: Type-check and commit**

Run: `pnpm type-check` — expected: clean.

```bash
git add packages/ui/src/components/PanelShell.tsx packages/ui/src/components/PanelShell.test.tsx packages/ui/src/stories/PanelShell.stories.tsx
git commit -m "feat(ui): add fill mode to PanelShell for viewport-locked layout"
```

---

### Task 2: FullscreenPanel height pass-through

**Files:**
- Modify: `apps/web/src/components/FullscreenPanel.tsx`
- Create: `apps/web/src/components/FullscreenPanel.test.tsx`

**Interfaces:**
- Consumes: `useFullscreenPanel(id)` (existing, unchanged).
- Produces: `FullscreenPanel` prop `className?: string` (default `''`), applied to the **non-fullscreen** wrapper only. The non-fullscreen wrapper becomes `relative flex min-h-0 flex-col ${className}` so `DashboardGrid` can pass sizing classes (`shrink-0`, `lg:flex-1`, `lg:flex-[3]`, …). The fullscreen overlay becomes a flex column (`flex flex-col` added) so `flex-1` children fill the viewport overlay.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/FullscreenPanel.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FullscreenPanel } from './FullscreenPanel';

describe('FullscreenPanel', () => {
  it('applies sizing className to the non-fullscreen wrapper', () => {
    const { container } = render(
      <FullscreenPanel className="lg:flex-1" id="test-panel">
        <p>content</p>
      </FullscreenPanel>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('lg:flex-1');
  });

  it('non-fullscreen wrapper is a min-h-0 flex column so height flows to the panel', () => {
    const { container } = render(
      <FullscreenPanel id="test-panel">
        <p>content</p>
      </FullscreenPanel>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('flex-col');
    expect(wrapper?.className).toContain('min-h-0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- apps/web/src/components/FullscreenPanel.test.tsx`
Expected: FAIL — `className` prop does not exist; wrapper classes are `relative` only.

- [ ] **Step 3: Implement the pass-through**

Replace `apps/web/src/components/FullscreenPanel.tsx` content with:

```tsx
import type { ReactNode } from 'react';
import { FullscreenToggleButton } from '@fluxora/ui';
import { useFullscreenPanel } from './useFullscreenPanel';

interface FullscreenPanelProps {
  id: string;
  children: ReactNode;
  /** Sizing classes for the non-fullscreen wrapper (e.g. shrink-0, lg:flex-1). */
  className?: string;
}

/**
 * Transparent wrapper that adds a floating fullscreen toggle to a panel. The
 * wrapped panel keeps its own frame and title; this only positions the toggle
 * and, when active, expands the panel to a full-viewport overlay. The wrapper
 * is a min-h-0 flex column so column height flows through to the panel.
 */
export function FullscreenPanel({ id, children, className = '' }: FullscreenPanelProps): JSX.Element {
  const { isFullscreen, toggleFullscreen } = useFullscreenPanel(id);
  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-auto bg-surface p-3'
          : `relative flex min-h-0 flex-col ${className}`
      }
    >
      {/* Fixed while fullscreen so the exit toggle stays viewport-anchored as content scrolls. */}
      <div className={isFullscreen ? 'fixed right-3 top-3 z-30' : 'absolute right-2 top-2 z-30'}>
        <FullscreenToggleButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- apps/web/src/components/FullscreenPanel.test.tsx apps/web/src/components/useFullscreenPanel.test.ts`
Expected: PASS (new tests plus the existing hook tests, which are unaffected).

- [ ] **Step 5: Type-check and commit**

Run: `pnpm type-check` — expected: clean.

```bash
git add apps/web/src/components/FullscreenPanel.tsx apps/web/src/components/FullscreenPanel.test.tsx
git commit -m "feat(web): pass column height through FullscreenPanel wrapper"
```

---

### Task 3: TradeTape — remove fitContent, fill flex share, fixed mobile height

**Files:**
- Modify: `apps/web/src/components/TradeTape.tsx`
- Modify: `apps/web/src/components/TradeTape.test.tsx`
- Modify: `apps/web/src/components/DashboardGrid.tsx` (only the `<TradeTape>` call site — remove the `fitContent` prop so the app still compiles; grid layout changes come in Task 7)

**Interfaces:**
- Consumes: `PanelShell` `fill` prop (Task 1).
- Produces: `TradeTape` props shrink to `{ symbol: string }` — the `fitContent` prop and stacked variant are deleted. The virtualised feed container (`data-testid="trade-tape-feed"`) carries `h-64 overflow-auto lg:h-auto lg:min-h-0 lg:flex-1`.

- [ ] **Step 1: Rewrite the tests to describe the new behaviour**

Replace the three `it(...)` blocks in `apps/web/src/components/TradeTape.test.tsx` (keep the imports, `makeTrade`, `beforeEach`/`afterEach` exactly as they are, but remove `fitContent` from any render):

```tsx
  it('reserves a fixed base height so streaming trades cannot shift the layout', () => {
    const { container } = render(<TradeTape symbol={SYMBOL} />);
    const feed = container.querySelector('[data-testid="trade-tape-feed"]');
    expect(feed).not.toBeNull();
    // h-64 below lg: the panel occupies the same space before and after trades
    // arrive, so nothing below it moves. overflow-auto keeps growth internal.
    expect(feed?.className).toContain('h-64');
    expect(feed?.className).toContain('overflow-auto');
  });

  it('fills its flex share on large screens', () => {
    const { container } = render(<TradeTape symbol={SYMBOL} />);
    const feed = container.querySelector('[data-testid="trade-tape-feed"]');
    expect(feed?.className).toContain('lg:flex-1');
    expect(feed?.className).toContain('lg:min-h-0');
  });

  it('renders a loading skeleton while no trades have arrived', () => {
    act(() => {
      useMarketStore.setState({ trades: {} });
    });
    const { getByRole } = render(<TradeTape symbol={SYMBOL} />);
    expect(getByRole('status')).toBeDefined();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- apps/web/src/components/TradeTape.test.tsx`
Expected: FAIL — default mode renders `h-64` on the virtualised container today, but `lg:flex-1` is absent, and TS errors on the removed `fitContent` usages confirm the old API is still present.

- [ ] **Step 3: Implement the new TradeTape**

In `apps/web/src/components/TradeTape.tsx`:

1. Delete the `fitContent` prop from `TradeTapeProps` (and its doc comment), delete `STACKED_TRADE_LIMIT`, and delete the whole `TradeTapeFitted` component.
2. Change the virtualised container's class and the shell:

```tsx
interface TradeTapeProps {
  symbol: string;
}
```

In `TradeTapeVirtualised`, the outer div becomes:

```tsx
    <div
      ref={parentRef}
      data-testid="trade-tape-feed"
      className="h-64 overflow-auto lg:h-auto lg:min-h-0 lg:flex-1"
    >
```

(the inner virtualiser markup is unchanged)

The exported component becomes:

```tsx
export function TradeTape({ symbol }: TradeTapeProps): JSX.Element {
  const trades = useMarketStore((s) => s.trades[symbol] ?? EMPTY_TRADES);

  return (
    <PanelShell fill className="relative" title={`${symbol} Trades`}>
      {trades.length > 0 && <StaleFeedOverlay />}
      {trades.length === 0 ? <TradeTapeSkeleton /> : <TradeTapeVirtualised trades={trades} />}
    </PanelShell>
  );
}
```

3. In `apps/web/src/components/DashboardGrid.tsx`, change the call site to:

```tsx
            <TradeTape symbol={activeSymbol} />
```

(remove only the `fitContent` prop — nothing else in this file yet)

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- apps/web/src/components/TradeTape.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Type-check and commit**

Run: `pnpm type-check` — expected: clean (confirms no other `fitContent` consumers exist).

```bash
git add apps/web/src/components/TradeTape.tsx apps/web/src/components/TradeTape.test.tsx apps/web/src/components/DashboardGrid.tsx
git commit -m "refactor(web): TradeTape fills its flex share; drop fitContent variant"
```

---

### Task 4: OrderBookPanel internal scroll

**Files:**
- Modify: `apps/web/src/components/OrderBookPanel.tsx`

**Interfaces:**
- Consumes: `PanelShell` `fill` prop (Task 1).
- Produces: no API change — `OrderBookPanel({ symbol })` unchanged.

No unit test for this task: `useOrderBookPanel` constructs a `new Worker(...)` on render, which jsdom cannot do, and mocking the worker pipeline here would test the mock, not the layout. Class changes are verified by type-check now and the manual verification in Task 8.

- [ ] **Step 1: Apply fill + internal scroll**

In `apps/web/src/components/OrderBookPanel.tsx`, populated branch (`return` at the bottom):

- `<PanelShell className="relative">` → `<PanelShell fill className="relative">`
- Header row div: `className="flex items-center gap-3 border-b border-border px-3 py-2 pr-9"` → `className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2 pr-9"`
- Body grid div: `className="grid grid-cols-2 gap-px bg-border"` → `className="grid min-h-0 flex-1 content-start grid-cols-2 gap-px overflow-auto bg-border"`

Loading branch (`orderBook === undefined`):

- `<PanelShell>` → `<PanelShell fill>`
- Its header row div gains `shrink-0` the same way.

(`content-start` keeps the two columns top-aligned when the panel is taller than its rows.)

- [ ] **Step 2: Type-check, lint, run existing tests**

Run: `pnpm type-check` — expected: clean.
Run: `pnpm test` — expected: all suites pass (no order-book render tests exist).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/OrderBookPanel.tsx
git commit -m "feat(web): order book fills left column and scrolls internally"
```

---

### Task 5: PortfolioPanel internal scroll

**Files:**
- Modify: `apps/web/src/components/PortfolioPanel.tsx`
- Create: `apps/web/src/components/PortfolioPanel.test.tsx`

**Interfaces:**
- Consumes: `usePortfolioPanel()` (unchanged); `usePaperTradingStore` state shape `{ positions: Record<string, { symbol: string; qty: number; avgEntryPrice: number }>, pendingOrders: PaperOrder[] }` for test setup.
- Produces: no API change — `PortfolioPanel()` unchanged. Root becomes a fill flex column; the positions/pending region scrolls.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/components/PortfolioPanel.test.tsx`:

```tsx
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { usePaperTradingStore } from '../store/paperTradingStore';
import { PortfolioPanel } from './PortfolioPanel';

describe('PortfolioPanel', () => {
  beforeEach(() => {
    act(() => {
      usePaperTradingStore.setState({
        positions: {
          'XBT/USD': { symbol: 'XBT/USD', qty: 0.5, avgEntryPrice: 50000 },
        },
      });
    });
  });

  afterEach(() => {
    act(() => {
      usePaperTradingStore.setState({ positions: {}, pendingOrders: [] });
    });
  });

  it('root is a min-h-0 flex column so it can fill its grid share', () => {
    const { container } = render(<PortfolioPanel />);
    const root = container.firstElementChild;
    expect(root?.className).toContain('flex-col');
    expect(root?.className).toContain('min-h-0');
    expect(root?.className).toContain('flex-1');
  });

  it('positions region scrolls internally instead of growing the panel', () => {
    const { container } = render(<PortfolioPanel />);
    const scrollRegion = container.querySelector('.overflow-auto');
    expect(scrollRegion).not.toBeNull();
    expect(scrollRegion?.className).toContain('flex-1');
    expect(scrollRegion?.className).toContain('min-h-0');
  });
});
```

Note: if `usePaperTradingStore.setState` types reject a partial `positions` record (position type may carry more fields), check `apps/web/src/store/paperTradingStore.ts` and include the extra required fields in the test fixture — do not cast to `any`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- apps/web/src/components/PortfolioPanel.test.tsx`
Expected: FAIL — root has no flex classes; no `overflow-auto` region exists.

- [ ] **Step 3: Implement**

In `apps/web/src/components/PortfolioPanel.tsx`:

- Root div: `className="rounded-lg border border-border bg-surface-elevated p-4"` → `className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface-elevated p-4"`
- Title row div: `className="mb-3 flex items-center justify-between pr-9"` → `className="mb-3 flex shrink-0 items-center justify-between pr-9"`
- Summary grid div: `className="grid grid-cols-3 gap-3"` → `className="grid shrink-0 grid-cols-3 gap-3"`
- Wrap the populated branch (the `<>...</>` fragment containing `PositionsTable` and the pending-orders block) in a scroll region, replacing the fragment:

```tsx
        <div className="mt-3 min-h-0 flex-1 overflow-auto">
          {positionRows.length > 0 && <PositionsTable rows={positionRows} />}

          {pendingOrders.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-dim">Pending Limit Orders</p>
              <div className="flex flex-col gap-1">
                {pendingOrders.map((order) => (
                  <div
                    className="flex items-center justify-between rounded bg-surface-strong px-2 py-1"
                    key={order.id}
                  >
                    <span className="font-mono text-xs tabular-nums text-muted">
                      <span
                        className={order.side === 'buy' ? 'text-green-400' : 'text-red-400'}
                      >
                        {order.side.toUpperCase()}
                      </span>
                      {' '}
                      {order.symbol} {formatQuantity(order.qty)} @{' '}
                      ${formatPrice(order.limitPrice)}
                    </span>
                    <button
                      className="ml-2 text-xs text-dim hover:text-red-400"
                      onClick={() => handleCancelOrder(order.id)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
```

(The pending-orders markup is byte-for-byte what exists today — only the wrapping scroll `<div>` is new, replacing the `<>...</>` fragment.)

- In `PositionsTable`, the outer div loses its now-duplicated top margin: `className="mt-3 overflow-x-auto"` → `className="overflow-x-auto"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- apps/web/src/components/PortfolioPanel.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Type-check and commit**

Run: `pnpm type-check` — expected: clean.

```bash
git add apps/web/src/components/PortfolioPanel.tsx apps/web/src/components/PortfolioPanel.test.tsx
git commit -m "feat(web): portfolio panel fills its share and scrolls positions internally"
```

---

### Task 6: CandlestickChartPanel fills its flex share

**Files:**
- Modify: `apps/web/src/components/CandlestickChartPanel.tsx`

**Interfaces:**
- Consumes: nothing new. `CandlestickChart` already renders `w-full h-full` and `createChart(..., { autoSize: true })` (`packages/charts/src/useCandlestickChart.ts:51`), so it resizes with its container — the spec's open question is resolved, no charts-package change needed.
- Produces: no API change.

No unit test for this task: rendering the panel needs a TanStack `QueryClientProvider` and lightweight-charts inside jsdom (no `ResizeObserver`), which would test scaffolding rather than layout. Verified by type-check now and manual verification in Task 8.

- [ ] **Step 1: Apply flex fill classes**

In `apps/web/src/components/CandlestickChartPanel.tsx`:

- Root div: `className="rounded-lg border border-border bg-surface-elevated"` → `className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface-elevated"`
- Header row div: `className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 pr-9"` → `className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2 pr-9"`
- Loading skeleton div: `className="h-72 p-3"` → `className="h-72 p-3 lg:h-auto lg:min-h-0 lg:flex-1"`
- Chart container div: `className="h-72"` → `className="h-72 lg:h-auto lg:min-h-0 lg:flex-1"`

(Below `lg` the chart keeps its fixed 288px; at `lg+` it fills the `flex-[3]` share Task 7 assigns.)

- [ ] **Step 2: Type-check and run the suite**

Run: `pnpm type-check` — expected: clean.
Run: `pnpm test` — expected: all suites pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/CandlestickChartPanel.tsx
git commit -m "feat(web): chart panel fills its flex share at lg+"
```

---

### Task 7: Viewport-locked App shell and DashboardGrid

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/DashboardGrid.tsx`

**Interfaces:**
- Consumes: `FullscreenPanel` `className` prop (Task 2); fill-mode panels (Tasks 3–6).
- Produces: the final layout. No component API changes.

- [ ] **Step 1: Lock the App shell to the viewport**

In `apps/web/src/App.tsx`, replace the returned JSX with:

```tsx
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface text-primary">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Fluxora</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectionBadge />
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <DashboardGrid activeSymbol={activeSymbol} />
      </main>
      <ToastViewport />
    </div>
  );
```

(The header drops `sticky top-0 z-20` — the page no longer scrolls; `<main>` is the single scroll container for both the below-`lg` layout and the short-viewport fallback.)

- [ ] **Step 2: Rewrite DashboardGrid with the locked grid and panel shares**

Replace `apps/web/src/components/DashboardGrid.tsx` content (imports and props interface unchanged) with:

```tsx
/**
 * Viewport-locked at lg+: the grid fills the area under the header exactly and
 * data-dense panels (order book, trades, portfolio) scroll internally, so every
 * panel stays on screen with no page scroll and no layout shift as data
 * streams in. Below lg it remains a single content-sized scrolling column. The
 * min-height floor lets very short viewports fall back to page scroll instead
 * of crushing panels. Tailwind only — no JS breakpoint logic.
 */
export function DashboardGrid({ activeSymbol }: DashboardGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-2 p-2 lg:h-full lg:min-h-[640px] lg:grid-cols-2">
      <div className="flex min-h-0 flex-col gap-2">
        <FullscreenPanel className="shrink-0" id="watchlist">
          <PanelErrorBoundary name="watchlist">
            <WatchlistPanel />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel className="shrink-0" id="ticker">
          <PanelErrorBoundary name="ticker">
            <TickerPanel symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel className="lg:flex-1" id="order-book">
          <PanelErrorBoundary name="order book">
            <OrderBookPanel key={activeSymbol} symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
      </div>
      <div className="flex min-h-0 flex-col gap-2">
        <FullscreenPanel className="lg:flex-[3]" id="chart">
          <PanelErrorBoundary name="chart">
            <CandlestickChartPanel symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel className="lg:flex-[2]" id="trades">
          <PanelErrorBoundary name="trade tape">
            <TradeTape symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel className="shrink-0" id="order-entry">
          <PanelErrorBoundary name="order entry">
            <OrderEntryPanel symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel className="lg:flex-[2]" id="portfolio">
          <PanelErrorBoundary name="portfolio">
            <PortfolioPanel />
          </PanelErrorBoundary>
        </FullscreenPanel>
      </div>
    </div>
  );
}
```

Notes:
- The right column shares out at 3 : 2 : 2 (chart : trades : portfolio) after the content-sized Order Entry takes its space; the left column gives Order Book everything below Watchlist and Ticker.
- `FullscreenPanel`'s base wrapper already carries `min-h-0` (Task 2), so per-instance classes only add the flex share.
- `PanelErrorBoundary` renders its child directly, so it does not break the height chain; if type-check or the dev server shows panels not filling, check whether it introduces a wrapper element and give that wrapper `flex min-h-0 flex-1 flex-col` — but only if actually needed.

- [ ] **Step 3: Type-check, lint, full test suite**

Run: `pnpm type-check` — expected: clean.
Run: `pnpm lint` — expected: clean (`--max-warnings 0`).
Run: `pnpm test` — expected: all suites pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/components/DashboardGrid.tsx
git commit -m "feat(web): viewport-locked dashboard grid at lg+"
```

---

### Task 8: Full verification

**Files:** none created; fixes discovered here belong to the task that owns the file.

- [ ] **Step 1: Run the complete quality gate**

```bash
pnpm test && pnpm type-check && pnpm lint
```
Expected: everything passes.

- [ ] **Step 2: Manual verification in the running app**

Run: `pnpm dev` and check, in a browser:

1. **1440×900 and 1920×1080:** no vertical page scrollbar; all seven panels visible; Portfolio fully on screen.
2. **Layout stability:** on a hard refresh, watch the Trades panel as live trades stream in — Order Entry and Portfolio must not move.
3. **Internal scrolling:** Order Book, Trades, and Portfolio (with several positions) scroll within their panels; panel titles stay pinned.
4. **Narrow window (< 1024px wide):** single column, page scrolls, panels content-sized, Trades fixed at 256px.
5. **Short-wide window (e.g. 1280×600):** page scrolls (min-height floor) rather than crushing panels.
6. **Fullscreen toggle** on Trades and Chart: panel fills the overlay; Escape exits.
7. **Chart resize:** drag the window wider/taller at `lg+` — the chart canvas follows its container.

- [ ] **Step 3: Report**

Report the verification results honestly (per superpowers:verification-before-completion) — including any check that failed and was fixed, and whether Codacy analysis ran.
