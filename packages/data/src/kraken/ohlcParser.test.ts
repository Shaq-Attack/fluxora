import { describe, it, expect } from 'vitest';
import { parseKrakenOhlcMessage } from './ohlcParser';

function ohlcDatum(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    symbol: 'BTC/USD',
    open: '100.0',
    high: '110.0',
    low: '95.0',
    close: '105.0',
    volume: '12.5',
    interval_begin: '2026-06-12T10:00:00.000000Z',
    interval: 1,
    ...overrides,
  };
}

describe('parseKrakenOhlcMessage', () => {
  it('parses a snapshot into candles with epoch-second timestamps', () => {
    const raw = JSON.stringify({
      channel: 'ohlc',
      type: 'snapshot',
      data: [ohlcDatum(), ohlcDatum({ interval_begin: '2026-06-12T10:01:00.000000Z' })],
    });

    const parsed = parseKrakenOhlcMessage(raw);
    expect(parsed).not.toBeNull();
    if (parsed === null || parsed.kind !== 'snapshot') throw new Error('expected snapshot');

    expect(parsed.candles).toHaveLength(2);
    expect(parsed.candles[0]).toEqual({
      time: Math.floor(Date.parse('2026-06-12T10:00:00.000Z') / 1000),
      open: 100,
      high: 110,
      low: 95,
      close: 105,
      volume: 12.5,
    });
  });

  it('parses an update using the most recent datum in the frame', () => {
    const raw = JSON.stringify({
      channel: 'ohlc',
      type: 'update',
      data: [
        ohlcDatum({ close: '101.0' }),
        ohlcDatum({ close: '106.0', interval_begin: '2026-06-12T10:01:00.000000Z' }),
      ],
    });

    const parsed = parseKrakenOhlcMessage(raw);
    if (parsed === null || parsed.kind !== 'update') throw new Error('expected update');
    expect(parsed.candle.close).toBe(106);
    expect(parsed.candle.time).toBe(Math.floor(Date.parse('2026-06-12T10:01:00.000Z') / 1000));
  });

  it('ignores frames from other channels', () => {
    expect(parseKrakenOhlcMessage(JSON.stringify({ channel: 'book' }))).toEqual({
      kind: 'ignore',
    });
  });

  it('returns null for malformed JSON and invalid frame shapes', () => {
    expect(parseKrakenOhlcMessage('{{')).toBeNull();
    expect(
      parseKrakenOhlcMessage(
        JSON.stringify({ channel: 'ohlc', type: 'snapshot', data: [{ bad: true }] }),
      ),
    ).toBeNull();
  });

  it('drops candles with an unparseable interval_begin', () => {
    const raw = JSON.stringify({
      channel: 'ohlc',
      type: 'snapshot',
      data: [ohlcDatum({ interval_begin: 'not-a-date' }), ohlcDatum()],
    });

    const parsed = parseKrakenOhlcMessage(raw);
    if (parsed === null || parsed.kind !== 'snapshot') throw new Error('expected snapshot');
    expect(parsed.candles).toHaveLength(1);
  });
});
