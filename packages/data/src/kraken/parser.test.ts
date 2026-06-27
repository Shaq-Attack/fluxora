import { describe, it, expect } from 'vitest';
import { parseKrakenMessage } from './parser';

describe('parseKrakenMessage', () => {
  // --- Error / ignore cases ---

  it('returns null for malformed JSON', () => {
    const result = parseKrakenMessage('{not valid json');
    expect(result).toBeNull();
  });

  it('returns { kind: "ignore" } for a non-ticker/trade channel (heartbeat)', () => {
    const raw = JSON.stringify({ channel: 'heartbeat', data: [] });
    const result = parseKrakenMessage(raw);
    expect(result).toEqual({ kind: 'ignore' });
  });

  it('returns { kind: "ignore" } for a frame with no channel field', () => {
    const raw = JSON.stringify({ type: 'snapshot', data: [] });
    const result = parseKrakenMessage(raw);
    expect(result).toEqual({ kind: 'ignore' });
  });

  // --- Ticker frames ---

  it('parses a ticker snapshot frame into Ticker[]', () => {
    const raw = JSON.stringify({
      channel: 'ticker',
      type: 'snapshot',
      data: [
        {
          symbol: 'BTC/USD',
          bid: 50000,
          ask: 50001,
          last: 50000.5,
          volume: 100,
          change: 500,
          change_pct: 1.0,
        },
      ],
    });
    const result = parseKrakenMessage(raw);
    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.kind).toBe('ticker');
    if (result.kind !== 'ticker') return;
    expect(result.data[0].symbol).toBe('BTC/USD');
    expect(result.data[0].bid).toBe(50000);
    expect(result.data[0].ask).toBe(50001);
    expect(result.data[0].price).toBe(50000.5);
    expect(result.data[0].exchange).toBe('kraken');
  });

  it('maps volume, change, and change_pct from ticker datum', () => {
    const raw = JSON.stringify({
      channel: 'ticker',
      type: 'update',
      data: [
        {
          symbol: 'ETH/USD',
          bid: 3000,
          ask: 3001,
          last: 3000.5,
          volume: 100,
          change: 500,
          change_pct: 1.0,
        },
      ],
    });
    const result = parseKrakenMessage(raw);
    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.kind).toBe('ticker');
    if (result.kind !== 'ticker') return;
    expect(result.data[0].volume24h).toBe(100);
    expect(result.data[0].change24h).toBe(500);
    expect(result.data[0].changePercent24h).toBe(1.0);
  });

  it('returns null for a ticker frame with a missing required bid field', () => {
    const raw = JSON.stringify({
      channel: 'ticker',
      type: 'snapshot',
      data: [
        {
          symbol: 'BTC/USD',
          // bid is intentionally omitted
          ask: 50001,
          last: 50000.5,
          volume: 100,
          change: 500,
          change_pct: 1.0,
        },
      ],
    });
    const result = parseKrakenMessage(raw);
    expect(result).toBeNull();
  });

  // XRP/USD is absent from the krakenSymbol enum; Zod rejects the datum and the parser returns null
  it('returns null for a ticker frame with an unknown symbol', () => {
    const raw = JSON.stringify({
      channel: 'ticker',
      type: 'snapshot',
      data: [
        {
          symbol: 'XRP/USD',
          bid: 1,
          ask: 1.01,
          last: 1.005,
          volume: 10000,
          change: 0.01,
          change_pct: 0.5,
        },
      ],
    });
    const result = parseKrakenMessage(raw);
    expect(result).toBeNull();
  });

  // --- Trade frames ---

  it('parses a trade frame into Trade[]', () => {
    const raw = JSON.stringify({
      channel: 'trade',
      type: 'snapshot',
      data: [
        {
          symbol: 'BTC/USD',
          side: 'buy',
          price: 50000,
          qty: 0.5,
          trade_id: 999,
          timestamp: '2024-01-15T12:00:00.000Z',
        },
      ],
    });
    const result = parseKrakenMessage(raw);
    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.kind).toBe('trade');
    if (result.kind !== 'trade') return;
    expect(result.data[0].id).toBe('999');
    expect(result.data[0].symbol).toBe('BTC/USD');
    expect(result.data[0].price).toBe(50000);
    expect(result.data[0].quantity).toBe(0.5);
    expect(result.data[0].side).toBe('buy');
    expect(result.data[0].exchange).toBe('kraken');
    expect(result.data[0].timestamp).toBe(new Date('2024-01-15T12:00:00.000Z').getTime());
  });

  it('parses multiple trades in a single frame', () => {
    const raw = JSON.stringify({
      channel: 'trade',
      type: 'snapshot',
      data: [
        {
          symbol: 'BTC/USD',
          side: 'buy',
          price: 50000,
          qty: 0.5,
          trade_id: 1001,
          timestamp: '2024-01-15T12:00:00.000Z',
        },
        {
          symbol: 'ETH/USD',
          side: 'sell',
          price: 3000,
          qty: 1.0,
          trade_id: 1002,
          timestamp: '2024-01-15T12:00:01.000Z',
        },
      ],
    });
    const result = parseKrakenMessage(raw);
    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.kind).toBe('trade');
    if (result.kind !== 'trade') return;
    expect(result.data.length).toBe(2);
  });

  it('returns null for a trade frame with an invalid side value', () => {
    const raw = JSON.stringify({
      channel: 'trade',
      type: 'snapshot',
      data: [
        {
          symbol: 'BTC/USD',
          side: 'hold',
          price: 50000,
          qty: 0.5,
          trade_id: 777,
          timestamp: '2024-01-15T12:00:00.000Z',
        },
      ],
    });
    const result = parseKrakenMessage(raw);
    expect(result).toBeNull();
  });
});
