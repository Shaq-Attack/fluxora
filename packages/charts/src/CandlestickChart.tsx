import { useRef } from 'react';
import type { Candle } from '@fluxora/types';
import { useCandlestickChart } from './useCandlestickChart';
import type { IndicatorConfig } from './indicators';

export interface CandlestickChartProps {
  candles: Candle[];
  streamCandle?: Candle | undefined;
  indicators?: IndicatorConfig;
  maxBars?: number;
}

export function CandlestickChart({
  candles,
  streamCandle,
  indicators,
  maxBars,
}: CandlestickChartProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  useCandlestickChart({ containerRef, candles, streamCandle, indicators, maxBars });
  return <div ref={containerRef} className="w-full h-full" />;
}
