import { z } from 'zod';
import type { Ticker, Trade } from '@fluxora/types';

const krakenSymbol = z.enum(['BTC/USD', 'ETH/USD']);

const channelFrameSchema = z.object({
  channel: z.string(),
});

const tickerDatumSchema = z.object({
  symbol: krakenSymbol,
  bid: z.number(),
  bid_qty: z.number().optional(),
  ask: z.number(),
  ask_qty: z.number().optional(),
  last: z.number(),
  volume: z.number().default(0),
  change: z.number().default(0),
  change_pct: z.number().default(0),
});

const tickerFrameSchema = z.object({
  channel: z.literal('ticker'),
  type: z.string(),
  data: z.array(tickerDatumSchema),
});

const tradeDatumSchema = z.object({
  symbol: krakenSymbol,
  side: z.enum(['buy', 'sell']),
  price: z.number(),
  qty: z.number(),
  trade_id: z.number(),
  timestamp: z.string().datetime(),
  ord_type: z.string().optional(),
});

const tradeFrameSchema = z.object({
  channel: z.literal('trade'),
  type: z.string(),
  data: z.array(tradeDatumSchema),
});

export type ParsedKrakenMessage =
  | { kind: 'ticker'; data: Ticker[] }
  | { kind: 'trade'; data: Trade[] }
  | { kind: 'ignore' };

export function parseKrakenMessage(raw: string): ParsedKrakenMessage | null {
  let frame: unknown;
  try {
    frame = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  const channelResult = channelFrameSchema.safeParse(frame);
  if (!channelResult.success) return { kind: 'ignore' };

  const { channel } = channelResult.data;

  if (channel === 'ticker') {
    const result = tickerFrameSchema.safeParse(frame);
    if (!result.success) return null;
    const tickers: Ticker[] = result.data.data.map((d) => ({
      symbol: d.symbol,
      exchange: 'kraken' as const,
      bid: d.bid,
      ask: d.ask,
      price: d.last,
      volume24h: d.volume,
      change24h: d.change,
      changePercent24h: d.change_pct,
      timestamp: Date.now(),
    }));
    return { kind: 'ticker', data: tickers };
  }

  if (channel === 'trade') {
    const result = tradeFrameSchema.safeParse(frame);
    if (!result.success) return null;
    const trades: Trade[] = result.data.data.map((d) => ({
      id: String(d.trade_id),
      symbol: d.symbol,
      exchange: 'kraken' as const,
      price: d.price,
      quantity: d.qty,
      side: d.side,
      timestamp: new Date(d.timestamp).getTime(),
    }));
    return { kind: 'trade', data: trades };
  }

  return { kind: 'ignore' };
}
