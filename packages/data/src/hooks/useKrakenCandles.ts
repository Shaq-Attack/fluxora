import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Candle, Timeframe } from '@fluxora/types';
import { KrakenOhlcConnection } from '../kraken/ohlcConnection';
import { parseKrakenOhlcMessage } from '../kraken/ohlcParser';
import { fetchKrakenCandles } from '../kraken/restCandles';
import { TIMEFRAME_TO_INTERVAL } from '../kraken/constants';

const candleKeys = {
  history: (symbol: string, timeframe: Timeframe) =>
    ['kraken', 'candles', symbol, timeframe] as const,
};

export interface UseKrakenCandlesOptions {
  symbol: string;
  timeframe: Timeframe;
}

export interface UseKrakenCandlesResult {
  historicalCandles: Candle[];
  streamCandle: Candle | undefined;
  isLoading: boolean;
}

export function useKrakenCandles({
  symbol,
  timeframe,
}: UseKrakenCandlesOptions): UseKrakenCandlesResult {
  const { data: historicalCandles = [], isLoading } = useQuery({
    queryKey: candleKeys.history(symbol, timeframe),
    queryFn: () => fetchKrakenCandles(symbol, timeframe),
    staleTime: 60_000,
  });

  const [streamCandle, setStreamCandle] = useState<Candle | undefined>(undefined);
  // Fallback history from WS snapshot when REST fails or is still loading
  const [snapshotCandles, setSnapshotCandles] = useState<Candle[]>([]);

  useEffect(() => {
    setStreamCandle(undefined);
    setSnapshotCandles([]);
    let cancelled = false;

    const connection = new KrakenOhlcConnection({
      symbol,
      interval: TIMEFRAME_TO_INTERVAL[timeframe],
      onMessage: (raw) => {
        if (cancelled) return;
        const parsed = parseKrakenOhlcMessage(raw);
        if (parsed === null || parsed.kind === 'ignore') return;
        if (parsed.kind === 'snapshot') {
          const { candles } = parsed;
          if (candles.length > 0) {
            // Store all but the last as fallback history; last is the in-progress candle
            setSnapshotCandles(candles.length > 1 ? candles.slice(0, -1) : []);
            setStreamCandle(candles[candles.length - 1]);
          }
        } else {
          setStreamCandle(parsed.candle);
        }
      },
      onStatusChange: () => undefined,
    });

    connection.connect();

    return () => {
      cancelled = true;
      connection.disconnect();
    };
    // connection created once per symbol+timeframe; setState setters are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe]);

  // REST history takes precedence over WS snapshot fallback once it loads
  const effectiveHistorical = historicalCandles.length > 0 ? historicalCandles : snapshotCandles;
  return { historicalCandles: effectiveHistorical, streamCandle, isLoading };
}
