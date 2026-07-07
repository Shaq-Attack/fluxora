import { z } from 'zod';
import type { Ticker } from '@fluxora/types';
import { SYMBOL_TO_PAIR } from './constants';

const tickerPairSchema = z.object({
  a: z.tuple([z.string()]).rest(z.unknown()),
  b: z.tuple([z.string()]).rest(z.unknown()),
  c: z.tuple([z.string()]).rest(z.unknown()),
  v: z.tuple([z.string(), z.string()]).rest(z.unknown()),
  o: z.string(),
});

const tickerResponseSchema = z.object({
  error: z.array(z.string()),
  result: z.record(tickerPairSchema),
});

function parseNumeric(raw: string, field: string, symbol: string): number {
  const value = parseFloat(raw);
  if (isNaN(value)) {
    throw new Error(`[restTicker] Non-numeric ${field} for ${symbol}: "${raw}"`);
  }
  return value;
}

export async function fetchKrakenTickerSnapshot(symbol: string): Promise<Ticker> {
  const pair = SYMBOL_TO_PAIR[symbol] ?? symbol.replace('/', '');
  const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
  if (!response.ok) {
    throw new Error(`[restTicker] HTTP ${response.status} fetching ${symbol} ticker`);
  }

  const parsed = tickerResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`[restTicker] Invalid response schema for ${symbol}`);
  }

  if (parsed.data.error.length > 0) {
    throw new Error(`[restTicker] Kraken error: ${parsed.data.error.join(', ')}`);
  }

  const pairData = Object.values(parsed.data.result)[0];
  if (pairData === undefined) {
    throw new Error(`[restTicker] Empty result for ${symbol}`);
  }

  const ask = parseNumeric(pairData.a[0], 'ask', symbol);
  const bid = parseNumeric(pairData.b[0], 'bid', symbol);
  const price = parseNumeric(pairData.c[0], 'price', symbol);
  const volume24h = parseNumeric(pairData.v[1], 'volume24h', symbol);
  const open24h = parseNumeric(pairData.o, 'open24h', symbol);
  const change24h = price - open24h;
  const changePercent24h = open24h !== 0 ? (change24h / open24h) * 100 : 0;

  return {
    symbol,
    exchange: 'kraken',
    bid,
    ask,
    price,
    volume24h,
    change24h,
    changePercent24h,
    timestamp: Date.now(),
  };
}

/**
 * Probes Kraken for a symbol's validity by attempting a ticker fetch. Used to
 * reject unsupported pairs (e.g. BTC/ZAR, which Kraken doesn't list) at the
 * point the user adds them to the watchlist, rather than failing silently
 * downstream in every panel.
 */
export async function isKrakenPairSupported(symbol: string): Promise<boolean> {
  try {
    await fetchKrakenTickerSnapshot(symbol);
    return true;
  } catch {
    return false;
  }
}
