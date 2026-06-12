import { describe, it, expect } from 'vitest';
import { parseKrakenBookMessage } from './bookParser';

describe('parseKrakenBookMessage', () => {
  it('parses a v2 snapshot frame with object levels into [price, qty] tuples', () => {
    const raw = JSON.stringify({
      channel: 'book',
      type: 'snapshot',
      data: [
        {
          symbol: 'BTC/USD',
          bids: [{ price: 45283.5, qty: 0.5 }],
          asks: [{ price: 45285.2, qty: 0.001 }],
        },
      ],
    });

    expect(parseKrakenBookMessage(raw)).toEqual({
      kind: 'snapshot',
      symbol: 'BTC/USD',
      bids: [[45283.5, 0.5]],
      asks: [[45285.2, 0.001]],
    });
  });

  it('parses a v2 update frame including checksum and optional sequence id', () => {
    const raw = JSON.stringify({
      channel: 'book',
      type: 'update',
      data: [
        {
          symbol: 'BTC/USD',
          bids: [{ price: 45283.5, qty: 0 }],
          asks: [],
          checksum: 123456,
        },
      ],
    });

    expect(parseKrakenBookMessage(raw)).toEqual({
      kind: 'update',
      symbol: 'BTC/USD',
      bids: [[45283.5, 0]],
      asks: [],
      checksum: 123456,
    });
  });

  it('ignores frames from other channels', () => {
    const raw = JSON.stringify({ channel: 'ticker', type: 'update', data: [] });
    expect(parseKrakenBookMessage(raw)).toEqual({ kind: 'ignore' });
  });

  it('ignores non-book frames such as heartbeats and method acks', () => {
    expect(parseKrakenBookMessage(JSON.stringify({ channel: 'heartbeat' }))).toEqual({
      kind: 'ignore',
    });
    expect(parseKrakenBookMessage(JSON.stringify({ method: 'subscribe', success: true }))).toEqual({
      kind: 'ignore',
    });
  });

  it('returns null for malformed JSON', () => {
    expect(parseKrakenBookMessage('not json {')).toBeNull();
  });

  it('returns null for a book frame with an invalid payload shape', () => {
    const raw = JSON.stringify({
      channel: 'book',
      type: 'snapshot',
      data: [{ symbol: 'BTC/USD', bids: [[45283.5, 0.5]], asks: [] }],
    });
    expect(parseKrakenBookMessage(raw)).toBeNull();
  });
});
