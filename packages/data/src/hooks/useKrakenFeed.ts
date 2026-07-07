import { useEffect, useRef } from 'react';
import type { ConnectionStatus, Ticker, Trade } from '@fluxora/types';
import { KrakenAdapter } from '../kraken/adapter';

export interface UseKrakenFeedOptions {
  symbols: string[];
  onTicker: (tickers: Ticker[]) => void;
  onTrade: (trades: Trade[]) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onLatency?: (ms: number) => void;
}

export function useKrakenFeed(options: UseKrakenFeedOptions): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const adapterRef = useRef<KrakenAdapter | null>(null);

  useEffect(() => {
    const adapter = new KrakenAdapter({
      symbols: optionsRef.current.symbols,
      onTicker: (tickers) => optionsRef.current.onTicker(tickers),
      onTrade: (trades) => optionsRef.current.onTrade(trades),
      onStatusChange: (status) => optionsRef.current.onStatusChange(status),
      onLatency: (ms) => optionsRef.current.onLatency?.(ms),
    });
    adapterRef.current = adapter;
    adapter.start();
    return () => {
      adapter.stop();
      adapterRef.current = null;
    };
    // adapter is created once; callbacks proxied via ref to always call the latest version
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    adapterRef.current?.setSymbols(options.symbols);
  }, [options.symbols]);
}
