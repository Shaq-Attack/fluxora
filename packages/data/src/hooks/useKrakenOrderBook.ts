import { useEffect, useRef } from 'react';
import type { ConnectionStatus, OrderBook } from '@fluxora/types';
import type { WorkerInboundMessage, WorkerOutboundMessage } from '@fluxora/worker';
import { KrakenBookConnection } from '../kraken/bookConnection';
import { parseKrakenBookMessage } from '../kraken/bookParser';
import { fetchKrakenDepthSnapshot } from '../kraken/restDepth';

export interface UseKrakenOrderBookOptions {
  symbol: string;
  depth: number;
  worker: Worker;
  onOrderBook: (ob: OrderBook) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

export function useKrakenOrderBook(options: UseKrakenOrderBookOptions): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let cancelled = false;
    const { symbol, depth, worker } = optionsRef.current;

    const subscribeMsg: WorkerInboundMessage = {
      type: 'SUBSCRIBE',
      symbol,
      exchange: 'kraken',
    };
    worker.postMessage(subscribeMsg);

    function handleResync(): void {
      if (cancelled) return;
      fetchKrakenDepthSnapshot(symbol, depth)
        .then((snapshot) => {
          if (cancelled) return;
          const snapshotMsg: WorkerInboundMessage = {
            type: 'SNAPSHOT',
            symbol,
            exchange: 'kraken',
            payload: snapshot,
          };
          worker.postMessage(snapshotMsg);
        })
        .catch((err: unknown) => {
          console.error('[useKrakenOrderBook] re-sync failed:', err);
        });
    }

    worker.onmessage = (event: MessageEvent): void => {
      const msg = event.data as WorkerOutboundMessage;
      switch (msg.type) {
        case 'ORDER_BOOK_UPDATE':
          optionsRef.current.onOrderBook(msg.payload);
          break;
        case 'CHECKSUM_MISMATCH':
        case 'SEQUENCE_GAP':
          handleResync();
          break;
      }
    };

    const connection = new KrakenBookConnection({
      symbol,
      depth,
      onMessage: (raw) => {
        const parsed = parseKrakenBookMessage(raw);
        if (parsed === null || parsed.kind === 'ignore') return;

        if (parsed.kind === 'snapshot') {
          const payload: OrderBook = {
            symbol: parsed.symbol,
            exchange: 'kraken',
            bids: parsed.bids.map(([price, quantity]) => ({ price, quantity })),
            asks: parsed.asks.map(([price, quantity]) => ({ price, quantity })),
            timestamp: Date.now(),
          };
          const snapshotMsg: WorkerInboundMessage = {
            type: 'SNAPSHOT',
            symbol: parsed.symbol,
            exchange: 'kraken',
            payload,
          };
          worker.postMessage(snapshotMsg);
        } else {
          const deltaMsg: WorkerInboundMessage = {
            type: 'DELTA',
            symbol: parsed.symbol,
            exchange: 'kraken',
            payload: {
              bids: parsed.bids,
              asks: parsed.asks,
              checksum: parsed.checksum,
              ...(parsed.sequenceId !== undefined ? { sequenceId: parsed.sequenceId } : {}),
            },
          };
          worker.postMessage(deltaMsg);
        }
      },
      onStatusChange: (status) => optionsRef.current.onStatusChange(status),
    });

    connection.connect();

    return () => {
      cancelled = true;
      connection.disconnect();
      worker.onmessage = null;
    };
    // connection and worker are created once per mount; callbacks proxied via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
