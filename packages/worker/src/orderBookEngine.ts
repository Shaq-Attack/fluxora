import type { OrderBook, Exchange } from '@fluxora/types';
import type { WorkerInboundMessage, WorkerOutboundMessage } from './messages';
import { computeKrakenChecksum } from './crc32';
import type { ChecksumPrecision } from './crc32';

interface EngineLevel {
  price: number;
  quantity: number;
}

interface BookEntry {
  bids: EngineLevel[];
  asks: EngineLevel[];
  sequenceId: number | null;
}

interface BookConfig {
  depth: number;
  checksumPrecision: ChecksumPrecision | null;
}

const DEFAULT_DEPTH = 25;

function applyDelta(levels: EngineLevel[], deltas: [number, number][]): EngineLevel[] {
  const result = [...levels];
  for (const [price, quantity] of deltas) {
    const idx = result.findIndex((l) => l.price === price);
    if (quantity === 0) {
      if (idx !== -1) result.splice(idx, 1);
    } else if (idx !== -1) {
      result[idx] = { price, quantity };
    } else {
      result.push({ price, quantity });
    }
  }
  return result;
}

export interface OrderBookEngine {
  handleMessage: (msg: WorkerInboundMessage) => void;
}

export function createOrderBookEngine(
  post: (msg: WorkerOutboundMessage) => void,
): OrderBookEngine {
  const books = new Map<string, BookEntry>();
  const configs = new Map<string, BookConfig>();

  function configFor(key: string): BookConfig {
    return configs.get(key) ?? { depth: DEFAULT_DEPTH, checksumPrecision: null };
  }

  function postOrderBookUpdate(
    symbol: string,
    exchange: Exchange,
    entry: BookEntry,
    depth: number,
  ): void {
    const bids = entry.bids.slice(0, depth).map((l) => ({ price: l.price, quantity: l.quantity }));
    const asks = entry.asks.slice(0, depth).map((l) => ({ price: l.price, quantity: l.quantity }));
    const payload: OrderBook = {
      symbol,
      exchange,
      bids,
      asks,
      timestamp: Date.now(),
      ...(entry.sequenceId !== null ? { sequenceId: entry.sequenceId } : {}),
    };
    post({ type: 'ORDER_BOOK_UPDATE', payload });
  }

  function handleMessage(msg: WorkerInboundMessage): void {
    switch (msg.type) {
      case 'SUBSCRIBE': {
        const key = `${msg.symbol}:${msg.exchange}`;
        configs.set(key, {
          depth: msg.depth ?? DEFAULT_DEPTH,
          checksumPrecision: msg.checksumPrecision ?? null,
        });
        if (!books.has(key)) {
          books.set(key, { bids: [], asks: [], sequenceId: null });
        }
        break;
      }
      case 'UNSUBSCRIBE': {
        const key = `${msg.symbol}:${msg.exchange}`;
        books.delete(key);
        configs.delete(key);
        break;
      }
      case 'SNAPSHOT': {
        const key = `${msg.symbol}:${msg.exchange}`;
        const { depth } = configFor(key);
        const entry: BookEntry = {
          bids: [...msg.payload.bids].sort((a, b) => b.price - a.price),
          asks: [...msg.payload.asks].sort((a, b) => a.price - b.price),
          sequenceId: msg.payload.sequenceId ?? null,
        };
        books.set(key, entry);
        postOrderBookUpdate(msg.symbol, msg.exchange, entry, depth);
        break;
      }
      case 'DELTA': {
        const key = `${msg.symbol}:${msg.exchange}`;
        const entry = books.get(key);
        if (entry === undefined) break;

        const { depth, checksumPrecision } = configFor(key);
        const { payload } = msg;

        if (payload.sequenceId !== undefined && entry.sequenceId !== null) {
          if (payload.sequenceId !== entry.sequenceId + 1) {
            post({
              type: 'SEQUENCE_GAP',
              symbol: msg.symbol,
              exchange: msg.exchange,
              expected: entry.sequenceId + 1,
              received: payload.sequenceId,
            });
            break;
          }
        }

        entry.bids = applyDelta(entry.bids, payload.bids);
        entry.asks = applyDelta(entry.asks, payload.asks);
        entry.bids.sort((a, b) => b.price - a.price);
        entry.asks.sort((a, b) => a.price - b.price);
        // Kraken does not send removals for levels pushed beyond the subscribed
        // depth — truncate, or stale levels resurface and corrupt the checksum
        entry.bids = entry.bids.slice(0, depth);
        entry.asks = entry.asks.slice(0, depth);

        if (payload.sequenceId !== undefined) {
          entry.sequenceId = payload.sequenceId;
        }

        if (payload.checksum !== undefined && checksumPrecision !== null) {
          const computed = computeKrakenChecksum(entry.bids, entry.asks, checksumPrecision);
          if (computed !== payload.checksum) {
            post({ type: 'CHECKSUM_MISMATCH', symbol: msg.symbol, exchange: msg.exchange });
            break;
          }
        }

        postOrderBookUpdate(msg.symbol, msg.exchange, entry, depth);
        break;
      }
    }
  }

  return { handleMessage };
}

// Wire the engine to the dedicated-worker scope. Skipped when a window exists
// (jsdom/unit tests import this module outside a worker).
if (typeof self !== 'undefined' && !('window' in globalThis)) {
  const engine = createOrderBookEngine((msg) => self.postMessage(msg));
  self.onmessage = (event: MessageEvent): void => {
    engine.handleMessage(event.data as WorkerInboundMessage);
  };
}
