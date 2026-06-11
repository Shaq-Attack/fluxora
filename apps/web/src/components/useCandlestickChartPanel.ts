import { useKrakenCandles } from '@fluxora/data';
import type { UseKrakenCandlesResult } from '@fluxora/data';

export function useCandlestickChartPanel(symbol: string): UseKrakenCandlesResult {
  return useKrakenCandles({ symbol, timeframe: '1m' });
}
