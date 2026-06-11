import { useRef } from 'react';
import type { Candle } from '@fluxora/types';
import { useCandlestickChart } from './useCandlestickChart';

export interface CandlestickChartProps {
  candles: Candle[];
  streamCandle?: Candle | undefined;
}

export function CandlestickChart({ candles, streamCandle }: CandlestickChartProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  useCandlestickChart({ containerRef, candles, streamCandle });
  return <div ref={containerRef} className="w-full h-full" />;
}
