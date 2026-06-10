import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import type { Candle } from '@fluxora/types';

export interface UseCandlestickChartOptions {
  containerRef: RefObject<HTMLDivElement>;
  candles: Candle[];
  streamCandle: Candle | undefined;
}

function candleToBar(candle: Candle): { time: Time; open: number; high: number; low: number; close: number } {
  return {
    time: candle.time as unknown as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  };
}

export function useCandlestickChart({
  containerRef,
  candles,
  streamCandle,
}: UseCandlestickChartOptions): void {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Latest streamCandle accessible in the [candles] effect without adding it to deps
  const streamCandleRef = useRef(streamCandle);
  streamCandleRef.current = streamCandle;

  // Create chart instance once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      height: 300,
      width: 400,
      layout: { background: { color: '#030712' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set full dataset when historical candles load; re-apply the in-progress candle
  // afterwards so a TanStack Query refetch doesn't wipe the live bar
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || candles.length === 0) return;
    series.setData(candles.map(candleToBar));
    const live = streamCandleRef.current;
    if (live !== undefined) series.update(candleToBar(live));
  }, [candles]);

  // Stream in-progress candle updates
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || streamCandle === undefined) return;
    series.update(candleToBar(streamCandle));
  }, [streamCandle]);
}
