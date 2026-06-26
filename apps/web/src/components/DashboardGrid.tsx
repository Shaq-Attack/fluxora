import { CandlestickChartPanel } from './CandlestickChartPanel';
import { FullscreenPanel } from './FullscreenPanel';
import { OrderBookPanel } from './OrderBookPanel';
import { OrderEntryPanel } from './OrderEntryPanel';
import { PanelErrorBoundary } from './PanelErrorBoundary';
import { PortfolioPanel } from './PortfolioPanel';
import { TickerPanel } from './TickerPanel';
import { TradeTape } from './TradeTape';
import { WatchlistPanel } from './WatchlistPanel';

interface DashboardGridProps {
  activeSymbol: string;
}

/**
 * Single scrolling page. Panels size to their content and the whole page
 * scrolls to reach the lower ones — no per-panel scroll trapping. A responsive
 * two-column grid uses the horizontal space on wide screens (Tailwind only, no
 * JS breakpoint logic) and collapses to one column on narrow screens.
 */
export function DashboardGrid({ activeSymbol }: DashboardGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-2 p-2 lg:grid-cols-2">
      <div className="flex flex-col gap-2">
        <FullscreenPanel id="watchlist">
          <PanelErrorBoundary name="watchlist">
            <WatchlistPanel />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel id="ticker">
          <PanelErrorBoundary name="ticker">
            <TickerPanel symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel id="order-book">
          <PanelErrorBoundary name="order book">
            <OrderBookPanel key={activeSymbol} symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
      </div>
      <div className="flex flex-col gap-2">
        <FullscreenPanel id="chart">
          <PanelErrorBoundary name="chart">
            <CandlestickChartPanel symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel id="trades">
          <PanelErrorBoundary name="trade tape">
            <TradeTape symbol={activeSymbol} fitContent />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel id="order-entry">
          <PanelErrorBoundary name="order entry">
            <OrderEntryPanel symbol={activeSymbol} />
          </PanelErrorBoundary>
        </FullscreenPanel>
        <FullscreenPanel id="portfolio">
          <PanelErrorBoundary name="portfolio">
            <PortfolioPanel />
          </PanelErrorBoundary>
        </FullscreenPanel>
      </div>
    </div>
  );
}
