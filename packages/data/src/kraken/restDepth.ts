import { z } from 'zod';
import type { OrderBook } from '@fluxora/types';

const SYMBOL_TO_PAIR: Record<string, string> = {
  'BTC/USD': 'XBTUSD',
  'ETH/USD': 'ETHUSD',
};

const restLevelSchema = z.tuple([z.string(), z.string(), z.number()]);

const restDepthResultSchema = z.object({
  bids: z.array(restLevelSchema),
  asks: z.array(restLevelSchema),
});

const restDepthResponseSchema = z.object({
  error: z.array(z.string()),
  result: z.record(restDepthResultSchema),
});

export async function fetchKrakenDepthSnapshot(symbol: string, depth: number): Promise<OrderBook> {
  const pair = SYMBOL_TO_PAIR[symbol] ?? symbol.replace('/', '');
  const response = await fetch(
    `https://api.kraken.com/0/public/Depth?pair=${pair}&count=${depth}`,
  );
  if (!response.ok) {
    throw new Error(`[restDepth] HTTP ${response.status} fetching ${symbol} depth`);
  }

  const parsed = restDepthResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`[restDepth] Invalid response schema for ${symbol}`);
  }

  const bookData = Object.values(parsed.data.result)[0];
  if (bookData === undefined) {
    throw new Error(`[restDepth] Empty result for ${symbol}`);
  }

  return {
    symbol,
    exchange: 'kraken',
    bids: bookData.bids
      .map(([p, q]) => ({ price: parseFloat(p), quantity: parseFloat(q) }))
      .sort((a, b) => b.price - a.price),
    asks: bookData.asks
      .map(([p, q]) => ({ price: parseFloat(p), quantity: parseFloat(q) }))
      .sort((a, b) => a.price - b.price),
    timestamp: Date.now(),
  };
}
