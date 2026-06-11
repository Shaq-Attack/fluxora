import { z } from 'zod';
import type { Candle } from '@fluxora/types';

const ohlcDatumSchema = z.object({
  symbol: z.string(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  close: z.string(),
  volume: z.string(),
  interval_begin: z.string(),
  interval: z.number(),
});

const ohlcFrameSchema = z.object({
  channel: z.literal('ohlc'),
  type: z.enum(['snapshot', 'update']),
  data: z.array(ohlcDatumSchema),
});

const channelFrameSchema = z.object({ channel: z.string() });

export type ParsedOhlcMessage =
  | { kind: 'snapshot'; candles: Candle[] }
  | { kind: 'update'; candle: Candle }
  | { kind: 'ignore' };

function datumToCandle(datum: z.infer<typeof ohlcDatumSchema>): Candle | null {
  const t = Math.floor(new Date(datum.interval_begin).getTime() / 1000);
  if (!Number.isFinite(t)) return null;
  return {
    time: t,
    open: parseFloat(datum.open),
    high: parseFloat(datum.high),
    low: parseFloat(datum.low),
    close: parseFloat(datum.close),
    volume: parseFloat(datum.volume),
  };
}

export function parseKrakenOhlcMessage(raw: string): ParsedOhlcMessage | null {
  let frame: unknown;
  try {
    frame = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  const channelResult = channelFrameSchema.safeParse(frame);
  if (!channelResult.success) return { kind: 'ignore' };
  if (channelResult.data.channel !== 'ohlc') return { kind: 'ignore' };

  const result = ohlcFrameSchema.safeParse(frame);
  if (!result.success) return null;

  const { type, data } = result.data;

  if (type === 'snapshot') {
    const candles = data.map(datumToCandle).filter((c): c is Candle => c !== null);
    return { kind: 'snapshot', candles };
  }

  const latest = data[data.length - 1];
  if (latest === undefined) return { kind: 'ignore' };
  const candle = datumToCandle(latest);
  if (candle === null) return { kind: 'ignore' };
  return { kind: 'update', candle };
}
