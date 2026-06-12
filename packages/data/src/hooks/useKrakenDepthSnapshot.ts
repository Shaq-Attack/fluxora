import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { OrderBook } from '@fluxora/types';
import { fetchKrakenDepthSnapshot } from '../kraken/restDepth';

const depthKeys = {
  snapshot: (symbol: string, depth: number) => ['kraken', symbol, 'depth', depth] as const,
};

export interface UseKrakenDepthSnapshotResult {
  data: OrderBook | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
}

export function useKrakenDepthSnapshot(
  symbol: string,
  depth: number,
): UseKrakenDepthSnapshotResult {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: depthKeys.snapshot(symbol, depth),
    queryFn: () => fetchKrakenDepthSnapshot(symbol, depth),
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });

  return { data, isLoading, error, isError };
}
