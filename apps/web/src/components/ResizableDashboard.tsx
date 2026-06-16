import { Group, Panel, Separator } from 'react-resizable-panels';
import type { Layout } from 'react-resizable-panels';
import { CandlestickChartPanel } from './CandlestickChartPanel';
import { FullscreenPanel } from './FullscreenPanel';
import { OrderBookPanel } from './OrderBookPanel';
import { OrderEntryPanel } from './OrderEntryPanel';
import { PanelErrorBoundary } from './PanelErrorBoundary';
import { PortfolioPanel } from './PortfolioPanel';
import { TickerPanel } from './TickerPanel';
import { TradeTape } from './TradeTape';
import { WatchlistPanel } from './WatchlistPanel';

interface ResizableDashboardProps {
  activeSymbol: string;
  outerLayout: Record<string, number>;
  mainLayout: Record<string, number>;
  onOuterLayoutChange: (layout: Layout) => void;
  onMainLayoutChange: (layout: Layout) => void;
}

const SEPARATOR_VERTICAL = 'w-1 cursor-col-resize bg-border transition-colors hover:bg-blue-500';
const SEPARATOR_HORIZONTAL = 'h-1 cursor-row-resize bg-border transition-colors hover:bg-blue-500';

/**
 * Wide-screen layout: drag-to-resize split panes inside a fixed viewport. Each
 * pane scrolls independently. This is the original desktop dashboard.
 */
export function ResizableDashboard({
  activeSymbol,
  outerLayout,
  mainLayout,
  onOuterLayoutChange,
  onMainLayoutChange,
}: ResizableDashboardProps): JSX.Element {
  return (
    <Group
      orientation="horizontal"
      defaultLayout={outerLayout}
      onLayoutChanged={onOuterLayoutChange}
      className="flex-1"
    >
      <Panel id="sidebar" minSize={15} className="overflow-auto">
        <FullscreenPanel id="watchlist">
          <PanelErrorBoundary name="watchlist">
            <WatchlistPanel />
          </PanelErrorBoundary>
        </FullscreenPanel>
      </Panel>
      <Separator className={SEPARATOR_VERTICAL} />
      <Panel id="main" minSize={40} className="overflow-auto">
        <Group orientation="vertical" defaultLayout={mainLayout} onLayoutChanged={onMainLayoutChange}>
          <Panel id="chart" minSize={15} className="overflow-auto">
            <FullscreenPanel id="chart">
              <PanelErrorBoundary name="chart">
                <CandlestickChartPanel symbol={activeSymbol} />
              </PanelErrorBoundary>
            </FullscreenPanel>
          </Panel>
          <Separator className={SEPARATOR_HORIZONTAL} />
          <Panel id="market-data" minSize={10} className="overflow-auto">
            <FullscreenPanel id="ticker">
              <PanelErrorBoundary name="ticker">
                <TickerPanel symbol={activeSymbol} />
              </PanelErrorBoundary>
            </FullscreenPanel>
            <FullscreenPanel id="trades">
              <PanelErrorBoundary name="trade tape">
                <TradeTape symbol={activeSymbol} />
              </PanelErrorBoundary>
            </FullscreenPanel>
          </Panel>
          <Separator className={SEPARATOR_HORIZONTAL} />
          <Panel id="order-book" minSize={10} className="overflow-auto">
            <FullscreenPanel id="order-book">
              <PanelErrorBoundary name="order book">
                <OrderBookPanel key={activeSymbol} symbol={activeSymbol} />
              </PanelErrorBoundary>
            </FullscreenPanel>
          </Panel>
          <Separator className={SEPARATOR_HORIZONTAL} />
          <Panel id="trading" minSize={10} className="overflow-auto">
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
          </Panel>
        </Group>
      </Panel>
    </Group>
  );
}
