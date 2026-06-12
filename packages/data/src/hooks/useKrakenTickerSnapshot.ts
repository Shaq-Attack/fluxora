import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { Ticker } from '@fluxora/types';
import { fetchKrakenTickerSnapshot } from '../kraken/restTicker';

const tickerKeys = {
  snapshot: (symbol: string) => ['kraken', symbol, 'ticker'] as const,
};

export interface UseKrakenTickerSnapshotResult {
  data: Ticker | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
}

export function useKrakenTickerSnapshot(symbol: string): UseKrakenTickerSnapshotResult {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: tickerKeys.snapshot(symbol),
    queryFn: () => fetchKrakenTickerSnapshot(symbol),
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });

  return { data, isLoading, error, isError };
}
