import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useKrakenCandles } from '@fluxora/data';
import type { Timeframe } from '@fluxora/types';
import type { IndicatorConfig } from '@fluxora/charts';
import type { Candle } from '@fluxora/types';

export interface UseCandlestickChartPanelResult {
  historicalCandles: Candle[];
  streamCandle: Candle | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  indicators: IndicatorConfig;
  setIndicators: Dispatch<SetStateAction<IndicatorConfig>>;
}

export function useCandlestickChartPanel(symbol: string): UseCandlestickChartPanelResult {
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [indicators, setIndicators] = useState<IndicatorConfig>({ vwap: false, emaPeriod: null });

  const { historicalCandles, streamCandle, isLoading, error, isError } = useKrakenCandles({
    symbol,
    timeframe,
  });

  return {
    historicalCandles,
    streamCandle,
    isLoading,
    error,
    isError,
    timeframe,
    setTimeframe,
    indicators,
    setIndicators,
  };
}
