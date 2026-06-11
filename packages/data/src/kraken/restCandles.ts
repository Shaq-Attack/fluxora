import { z } from 'zod';
import type { Candle, Timeframe } from '@fluxora/types';
import { SYMBOL_TO_PAIR, TIMEFRAME_TO_INTERVAL } from './constants';

const ohlcBarSchema = z.tuple([
  z.number(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.number(),
]);

const ohlcResponseSchema = z.object({
  error: z.array(z.string()),
  result: z.record(z.unknown()),
});

export async function fetchKrakenCandles(symbol: string, timeframe: Timeframe): Promise<Candle[]> {
  const pair = SYMBOL_TO_PAIR[symbol] ?? symbol.replace('/', '');
  const interval = TIMEFRAME_TO_INTERVAL[timeframe];

  const response = await fetch(
    `https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${interval}`,
  );
  if (!response.ok) {
    throw new Error(`[restCandles] HTTP ${response.status} fetching ${symbol} candles`);
  }

  const parsed = ohlcResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`[restCandles] Invalid response schema for ${symbol}`);
  }

  if (parsed.data.error.length > 0) {
    throw new Error(`[restCandles] Kraken error: ${parsed.data.error.join(', ')}`);
  }

  const candles: Candle[] = [];
  for (const [key, value] of Object.entries(parsed.data.result)) {
    if (key === 'last' || !Array.isArray(value)) continue;
    for (const rawBar of value) {
      const bar = ohlcBarSchema.safeParse(rawBar);
      if (!bar.success) continue;
      const [time, open, high, low, close, , volume] = bar.data;
      candles.push({
        time,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseFloat(volume),
      });
    }
    break;
  }

  if (candles.length === 0) {
    throw new Error(`[restCandles] No OHLC bars found in response for ${symbol}`);
  }

  candles.sort((a, b) => a.time - b.time);
  // Drop the in-progress candle (last bar) only when there is prior history to show
  return candles.length <= 1 ? candles : candles.slice(0, -1);
}
