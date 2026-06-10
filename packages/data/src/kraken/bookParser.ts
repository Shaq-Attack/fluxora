import { z } from 'zod';

const bookLevelSchema = z.object({
  price: z.number(),
  qty: z.number(),
});

const channelFrameSchema = z.object({
  channel: z.string(),
});

const snapshotDatumSchema = z.object({
  symbol: z.string(),
  bids: z.array(bookLevelSchema),
  asks: z.array(bookLevelSchema),
});

const snapshotFrameSchema = z.object({
  channel: z.literal('book'),
  type: z.literal('snapshot'),
  data: z.array(snapshotDatumSchema),
});

const updateDatumSchema = z.object({
  symbol: z.string(),
  bids: z.array(bookLevelSchema),
  asks: z.array(bookLevelSchema),
  checksum: z.number(),
  seq: z.number().optional(),
});

const updateFrameSchema = z.object({
  channel: z.literal('book'),
  type: z.literal('update'),
  data: z.array(updateDatumSchema),
});

export type ParsedBookMessage =
  | { kind: 'snapshot'; symbol: string; bids: [number, number][]; asks: [number, number][] }
  | { kind: 'update'; symbol: string; bids: [number, number][]; asks: [number, number][]; checksum: number; sequenceId?: number }
  | { kind: 'ignore' };

export function parseKrakenBookMessage(raw: string): ParsedBookMessage | null {
  let frame: unknown;
  try {
    frame = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  const channelResult = channelFrameSchema.safeParse(frame);
  if (!channelResult.success) return { kind: 'ignore' };
  if (channelResult.data.channel !== 'book') return { kind: 'ignore' };

  const typeCheck = z.object({ type: z.string() }).safeParse(frame);
  if (!typeCheck.success) return { kind: 'ignore' };

  if (typeCheck.data.type === 'snapshot') {
    const result = snapshotFrameSchema.safeParse(frame);
    if (!result.success || result.data.data.length === 0) return null;
    const datum = result.data.data[0];
    if (datum === undefined) return null;
    return {
      kind: 'snapshot',
      symbol: datum.symbol,
      bids: datum.bids.map(({ price, qty }) => [price, qty]),
      asks: datum.asks.map(({ price, qty }) => [price, qty]),
    };
  }

  if (typeCheck.data.type === 'update') {
    const result = updateFrameSchema.safeParse(frame);
    if (!result.success || result.data.data.length === 0) return null;
    const datum = result.data.data[0];
    if (datum === undefined) return null;
    const msg: ParsedBookMessage = {
      kind: 'update',
      symbol: datum.symbol,
      bids: datum.bids.map(({ price, qty }) => [price, qty]),
      asks: datum.asks.map(({ price, qty }) => [price, qty]),
      checksum: datum.checksum,
      ...(datum.seq !== undefined ? { sequenceId: datum.seq } : {}),
    };
    return msg;
  }

  return { kind: 'ignore' };
}
