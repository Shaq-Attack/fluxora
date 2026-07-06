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
