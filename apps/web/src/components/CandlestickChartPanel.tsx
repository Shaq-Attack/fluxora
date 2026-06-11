import { CandlestickChart } from '@fluxora/charts';
import { useCandlestickChartPanel } from './useCandlestickChartPanel';

interface CandlestickChartPanelProps {
  symbol: string;
}

export function CandlestickChartPanel({ symbol }: CandlestickChartPanelProps): JSX.Element {
  const { historicalCandles, streamCandle, isLoading } = useCandlestickChartPanel(symbol);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 px-3 py-2">
        <span className="text-sm font-semibold text-gray-300">{symbol} · 1m</span>
      </div>
      {isLoading && historicalCandles.length === 0 ? (
        <div className="px-3 py-3">
          <p className="text-xs text-gray-600">Loading chart…</p>
        </div>
      ) : (
        <div className="h-72">
          <CandlestickChart candles={historicalCandles} streamCandle={streamCandle} />
        </div>
      )}
    </div>
  );
}
