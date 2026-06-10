import type { OrderBook, Exchange } from '@fluxora/types';
import type { WorkerInboundMessage, WorkerOutboundMessage } from './messages';
import { computeKrakenChecksum } from './crc32';

interface EngineLevel {
  price: number;
  quantity: number;
}

interface BookEntry {
  bids: EngineLevel[];
  asks: EngineLevel[];
  sequenceId: number | null;
}

const books = new Map<string, BookEntry>();

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

function postOrderBookUpdate(symbol: string, exchange: Exchange, entry: BookEntry): void {
  const bids = entry.bids.slice(0, 25).map((l) => ({ price: l.price, quantity: l.quantity }));
  const asks = entry.asks.slice(0, 25).map((l) => ({ price: l.price, quantity: l.quantity }));
  const payload: OrderBook = {
    symbol,
    exchange,
    bids,
    asks,
    timestamp: Date.now(),
    ...(entry.sequenceId !== null ? { sequenceId: entry.sequenceId } : {}),
  };
  const msg: WorkerOutboundMessage = { type: 'ORDER_BOOK_UPDATE', payload };
  self.postMessage(msg);
}

self.onmessage = (event: MessageEvent): void => {
  const msg = event.data as WorkerInboundMessage;
  switch (msg.type) {
    case 'SUBSCRIBE': {
      const key = `${msg.symbol}:${msg.exchange}`;
      if (!books.has(key)) {
        books.set(key, { bids: [], asks: [], sequenceId: null });
      }
      break;
    }
    case 'UNSUBSCRIBE': {
      books.delete(`${msg.symbol}:${msg.exchange}`);
      break;
    }
    case 'SNAPSHOT': {
      const entry: BookEntry = {
        bids: [...msg.payload.bids].sort((a, b) => b.price - a.price),
        asks: [...msg.payload.asks].sort((a, b) => a.price - b.price),
        sequenceId: msg.payload.sequenceId ?? null,
      };
      books.set(`${msg.symbol}:${msg.exchange}`, entry);
      postOrderBookUpdate(msg.symbol, msg.exchange, entry);
      break;
    }
    case 'DELTA': {
      const key = `${msg.symbol}:${msg.exchange}`;
      const entry = books.get(key);
      if (entry === undefined) break;

      const { payload } = msg;

      if (payload.sequenceId !== undefined && entry.sequenceId !== null) {
        if (payload.sequenceId !== entry.sequenceId + 1) {
          const gapMsg: WorkerOutboundMessage = {
            type: 'SEQUENCE_GAP',
            symbol: msg.symbol,
            exchange: msg.exchange,
            expected: entry.sequenceId + 1,
            received: payload.sequenceId,
          };
          self.postMessage(gapMsg);
          break;
        }
      }

      entry.bids = applyDelta(entry.bids, payload.bids);
      entry.asks = applyDelta(entry.asks, payload.asks);
      entry.bids.sort((a, b) => b.price - a.price);
      entry.asks.sort((a, b) => a.price - b.price);

      if (payload.sequenceId !== undefined) {
        entry.sequenceId = payload.sequenceId;
      }

      if (payload.checksum !== undefined) {
        const computed = computeKrakenChecksum(entry.bids, entry.asks);
        if (computed !== payload.checksum) {
          const mismatchMsg: WorkerOutboundMessage = {
            type: 'CHECKSUM_MISMATCH',
            symbol: msg.symbol,
            exchange: msg.exchange,
          };
          self.postMessage(mismatchMsg);
          break;
        }
      }

      postOrderBookUpdate(msg.symbol, msg.exchange, entry);
      break;
    }
  }
};
