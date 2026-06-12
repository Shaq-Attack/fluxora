import { describe, it, expect } from 'vitest';
import { createOrderBookEngine } from './orderBookEngine';
import { computeKrakenChecksum } from './crc32';
import type { OrderBookEngine } from './orderBookEngine';
import type { WorkerOutboundMessage } from './messages';
import type { OrderBook, OrderBookLevel } from '@fluxora/types';

const PRECISION = { price: 1, qty: 8 };

function setup(): { engine: OrderBookEngine; posted: WorkerOutboundMessage[] } {
  const posted: WorkerOutboundMessage[] = [];
  const engine = createOrderBookEngine((msg) => posted.push(msg));
  return { engine, posted };
}

function snapshotPayload(
  bids: OrderBookLevel[],
  asks: OrderBookLevel[],
  sequenceId?: number,
): OrderBook {
  return {
    symbol: 'BTC/USD',
    exchange: 'kraken',
    bids,
    asks,
    timestamp: 0,
    ...(sequenceId !== undefined ? { sequenceId } : {}),
  };
}

function lastBookUpdate(posted: WorkerOutboundMessage[]): OrderBook {
  const updates = posted.filter((m) => m.type === 'ORDER_BOOK_UPDATE');
  const last = updates[updates.length - 1];
  if (last === undefined || last.type !== 'ORDER_BOOK_UPDATE') {
    throw new Error('no ORDER_BOOK_UPDATE posted');
  }
  return last.payload;
}

describe('createOrderBookEngine', () => {
  it('sorts snapshot bids descending and asks ascending', () => {
    const { engine, posted } = setup();
    engine.handleMessage({ type: 'SUBSCRIBE', symbol: 'BTC/USD', exchange: 'kraken', depth: 25 });
    engine.handleMessage({
      type: 'SNAPSHOT',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: snapshotPayload(
        [
          { price: 99, quantity: 1 },
          { price: 100, quantity: 1 },
        ],
        [
          { price: 102, quantity: 1 },
          { price: 101, quantity: 1 },
        ],
      ),
    });

    const book = lastBookUpdate(posted);
    expect(book.bids.map((l) => l.price)).toEqual([100, 99]);
    expect(book.asks.map((l) => l.price)).toEqual([101, 102]);
  });

  it('applies deltas: insert, update, and remove on qty=0', () => {
    const { engine, posted } = setup();
    engine.handleMessage({ type: 'SUBSCRIBE', symbol: 'BTC/USD', exchange: 'kraken', depth: 25 });
    engine.handleMessage({
      type: 'SNAPSHOT',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: snapshotPayload(
        [{ price: 100, quantity: 1 }],
        [{ price: 101, quantity: 1 }],
      ),
    });
    engine.handleMessage({
      type: 'DELTA',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: {
        bids: [
          [100, 0], // remove
          [99.5, 2], // insert
        ],
        asks: [[101, 3]], // update qty
      },
    });

    const book = lastBookUpdate(posted);
    expect(book.bids).toEqual([{ price: 99.5, quantity: 2 }]);
    expect(book.asks).toEqual([{ price: 101, quantity: 3 }]);
  });

  it('truncates the book to the subscribed depth after a delta', () => {
    const { engine, posted } = setup();
    engine.handleMessage({ type: 'SUBSCRIBE', symbol: 'BTC/USD', exchange: 'kraken', depth: 2 });
    engine.handleMessage({
      type: 'SNAPSHOT',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: snapshotPayload(
        [
          { price: 100, quantity: 1 },
          { price: 99, quantity: 1 },
        ],
        [],
      ),
    });
    // A better bid arrives: 99 falls outside depth 2 and must be dropped for good
    engine.handleMessage({
      type: 'DELTA',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: { bids: [[101, 1]], asks: [] },
    });
    // Top bid removed: the truncated 99 level must NOT resurface
    engine.handleMessage({
      type: 'DELTA',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: { bids: [[101, 0]], asks: [] },
    });

    const book = lastBookUpdate(posted);
    expect(book.bids.map((l) => l.price)).toEqual([100]);
  });

  it('posts ORDER_BOOK_UPDATE when the checksum matches', () => {
    const { engine, posted } = setup();
    engine.handleMessage({
      type: 'SUBSCRIBE',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      depth: 25,
      checksumPrecision: PRECISION,
    });
    engine.handleMessage({
      type: 'SNAPSHOT',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: snapshotPayload(
        [{ price: 100, quantity: 1 }],
        [{ price: 101, quantity: 1 }],
      ),
    });

    const expectedBook = {
      bids: [
        { price: 100, quantity: 1 },
        { price: 99.5, quantity: 2 },
      ],
      asks: [{ price: 101, quantity: 1 }],
    };
    engine.handleMessage({
      type: 'DELTA',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: {
        bids: [[99.5, 2]],
        asks: [],
        checksum: computeKrakenChecksum(expectedBook.bids, expectedBook.asks, PRECISION),
      },
    });

    expect(posted.some((m) => m.type === 'CHECKSUM_MISMATCH')).toBe(false);
    expect(lastBookUpdate(posted).bids).toEqual(expectedBook.bids);
  });

  it('posts CHECKSUM_MISMATCH and suppresses the update on mismatch', () => {
    const { engine, posted } = setup();
    engine.handleMessage({
      type: 'SUBSCRIBE',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      depth: 25,
      checksumPrecision: PRECISION,
    });
    engine.handleMessage({
      type: 'SNAPSHOT',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: snapshotPayload([{ price: 100, quantity: 1 }], [{ price: 101, quantity: 1 }]),
    });
    const updatesBefore = posted.filter((m) => m.type === 'ORDER_BOOK_UPDATE').length;

    engine.handleMessage({
      type: 'DELTA',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: { bids: [[99.5, 2]], asks: [], checksum: 12345 },
    });

    expect(posted.some((m) => m.type === 'CHECKSUM_MISMATCH')).toBe(true);
    expect(posted.filter((m) => m.type === 'ORDER_BOOK_UPDATE').length).toBe(updatesBefore);
  });

  it('skips checksum validation when no precision is configured', () => {
    const { engine, posted } = setup();
    engine.handleMessage({ type: 'SUBSCRIBE', symbol: 'BTC/USD', exchange: 'kraken', depth: 25 });
    engine.handleMessage({
      type: 'SNAPSHOT',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: snapshotPayload([{ price: 100, quantity: 1 }], []),
    });
    engine.handleMessage({
      type: 'DELTA',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: { bids: [[99, 1]], asks: [], checksum: 1 },
    });

    expect(posted.some((m) => m.type === 'CHECKSUM_MISMATCH')).toBe(false);
    expect(lastBookUpdate(posted).bids.map((l) => l.price)).toEqual([100, 99]);
  });

  it('posts SEQUENCE_GAP when a sequence id is skipped', () => {
    const { engine, posted } = setup();
    engine.handleMessage({ type: 'SUBSCRIBE', symbol: 'BTC/USD', exchange: 'kraken', depth: 25 });
    engine.handleMessage({
      type: 'SNAPSHOT',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: snapshotPayload([{ price: 100, quantity: 1 }], [], 5),
    });
    engine.handleMessage({
      type: 'DELTA',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: { bids: [[99, 1]], asks: [], sequenceId: 7 },
    });

    const gap = posted.find((m) => m.type === 'SEQUENCE_GAP');
    expect(gap).toEqual({
      type: 'SEQUENCE_GAP',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      expected: 6,
      received: 7,
    });
  });

  it('ignores deltas for symbols without a snapshot', () => {
    const { engine, posted } = setup();
    engine.handleMessage({
      type: 'DELTA',
      symbol: 'BTC/USD',
      exchange: 'kraken',
      payload: { bids: [[99, 1]], asks: [] },
    });
    expect(posted).toEqual([]);
  });
});
