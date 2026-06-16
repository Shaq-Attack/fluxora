import { CandlestickChartPanel } from './CandlestickChartPanel';
import { FullscreenPanel } from './FullscreenPanel';
import { OrderBookPanel } from './OrderBookPanel';
import { OrderEntryPanel } from './OrderEntryPanel';
import { PanelErrorBoundary } from './PanelErrorBoundary';
import { PortfolioPanel } from './PortfolioPanel';
import { TickerPanel } from './TickerPanel';
import { TradeTape } from './TradeTape';
import { WatchlistPanel } from './WatchlistPanel';

interface StackedDashboardProps {
  activeSymbol: string;
}

/**
 * Narrow-screen layout: a single column that the whole page scrolls through.
 * Panels size to their content — no per-panel scroll trapping. The trade tape
 * renders a capped recent window (fitContent) instead of its virtualised feed.
 */
export function StackedDashboard({ activeSymbol }: StackedDashboardProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 p-2">
      <FullscreenPanel id="watchlist">
        <PanelErrorBoundary name="watchlist">
          <WatchlistPanel />
        </PanelErrorBoundary>
      </FullscreenPanel>
      <FullscreenPanel id="chart">
        <PanelErrorBoundary name="chart">
          <CandlestickChartPanel symbol={activeSymbol} />
        </PanelErrorBoundary>
      </FullscreenPanel>
      <FullscreenPanel id="ticker">
        <PanelErrorBoundary name="ticker">
          <TickerPanel symbol={activeSymbol} />
        </PanelErrorBoundary>
      </FullscreenPanel>
      <FullscreenPanel id="trades">
        <PanelErrorBoundary name="trade tape">
          <TradeTape symbol={activeSymbol} fitContent />
        </PanelErrorBoundary>
      </FullscreenPanel>
      <FullscreenPanel id="order-book">
        <PanelErrorBoundary name="order book">
          <OrderBookPanel key={activeSymbol} symbol={activeSymbol} />
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
  );
}
