import { CandlestickChart } from '@fluxora/charts';
import { useCandlestickChartPanel } from './useCandlestickChartPanel';

interface CandlestickChartPanelProps {
  symbol: string;
}

export function CandlestickChartPanel({ symbol }: CandlestickChartPanelProps): JSX.Element {
  const { historicalCandles, streamCandle, isLoading, isError } = useCandlestickChartPanel(symbol);
  const hasCandles = historicalCandles.length > 0;

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 px-3 py-2">
        <span className="text-sm font-semibold text-gray-300">{symbol} · 1m</span>
      </div>
      {isError && !hasCandles ? (
        <div className="px-3 py-3">
          <p className="text-xs text-red-400">Failed to load chart data for {symbol}.</p>
        </div>
      ) : isLoading && !hasCandles ? (
        <div className="px-3 py-3">
          <p className="text-xs text-gray-600">Loading chart…</p>
        </div>
      ) : (
        <>
          {isError && (
            <p className="px-3 pt-2 text-xs text-amber-400">
              History refresh failed — showing live data.
            </p>
          )}
          <div className="h-72">
            <CandlestickChart candles={historicalCandles} streamCandle={streamCandle} />
          </div>
        </>
      )}
    </div>
  );
}
