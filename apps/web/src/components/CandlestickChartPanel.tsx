import { CandlestickChart } from '@fluxora/charts';
import type { Timeframe } from '@fluxora/types';
import { useCandlestickChartPanel } from './useCandlestickChartPanel';

interface CandlestickChartPanelProps {
  symbol: string;
}

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h'];

export function CandlestickChartPanel({ symbol }: CandlestickChartPanelProps): JSX.Element {
  const {
    historicalCandles,
    streamCandle,
    isLoading,
    isError,
    timeframe,
    setTimeframe,
    indicators,
    setIndicators,
  } = useCandlestickChartPanel(symbol);
  const hasCandles = historicalCandles.length > 0;

  function handleToggleVwap(): void {
    setIndicators((prev) => ({ ...prev, vwap: !prev.vwap }));
  }

  function handleToggleEma(): void {
    setIndicators((prev) => ({ ...prev, emaPeriod: prev.emaPeriod === null ? 9 : null }));
  }

  return (
    <div className="rounded-lg border border-border bg-surface-elevated">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <span className="text-sm font-semibold text-muted">
          {symbol} · {timeframe}
        </span>

        <div className="flex items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  tf === timeframe
                    ? 'bg-surface-strong text-primary ring-1 ring-inset ring-blue-500'
                    : 'text-dim hover:text-muted'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleVwap}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                indicators.vwap
                  ? 'bg-surface-strong text-purple-400 ring-1 ring-inset ring-purple-600'
                  : 'text-dim hover:text-muted'
              }`}
            >
              VWAP
            </button>
            <button
              type="button"
              onClick={handleToggleEma}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                indicators.emaPeriod !== null
                  ? 'bg-surface-strong text-amber-400 ring-1 ring-inset ring-amber-600'
                  : 'text-dim hover:text-muted'
              }`}
            >
              EMA(9)
            </button>
          </div>
        </div>
      </div>

      {isError && !hasCandles ? (
        <div className="px-3 py-3">
          <p className="text-xs text-red-400">Failed to load chart data for {symbol}.</p>
        </div>
      ) : isLoading && !hasCandles ? (
        <div className="px-3 py-3">
          <p className="text-xs text-subtle">Loading chart…</p>
        </div>
      ) : (
        <>
          {isError && (
            <p className="px-3 pt-2 text-xs text-amber-400">
              History refresh failed — showing live data.
            </p>
          )}
          <div className="h-72">
            <CandlestickChart
              candles={historicalCandles}
              streamCandle={streamCandle}
              indicators={indicators}
              maxBars={500}
            />
          </div>
        </>
      )}
    </div>
  );
}
