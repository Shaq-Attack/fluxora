import { describe, it, expect } from 'vitest';
import { crc32, computeKrakenChecksum } from './crc32';
import type { OrderBookLevel } from '@fluxora/types';

describe('crc32', () => {
  it('matches the standard CRC32 check vector', () => {
    expect(crc32('123456789')).toBe(0xcbf43926);
  });

  it('returns 0 for an empty string CRC of nothing-changed state', () => {
    expect(crc32('')).toBe(0);
  });
});

describe('computeKrakenChecksum', () => {
  const precision = { price: 1, qty: 8 };

  it('concatenates asks before bids, formatted to precision with decimal and leading zeros stripped', () => {
    const asks: OrderBookLevel[] = [{ price: 45285.2, quantity: 0.001 }];
    const bids: OrderBookLevel[] = [{ price: 45283.5, quantity: 0.5 }];

    // ask price "45285.2" -> "452852"; ask qty "0.00100000" -> "100000"
    // bid price "45283.5" -> "452835"; bid qty "0.50000000" -> "50000000"
    const expected = crc32('452852' + '100000' + '452835' + '50000000');

    expect(computeKrakenChecksum(bids, asks, precision)).toBe(expected);
  });

  it('differs from a bids-first concatenation (order is significant)', () => {
    const asks: OrderBookLevel[] = [{ price: 100.5, quantity: 1 }];
    const bids: OrderBookLevel[] = [{ price: 99.5, quantity: 2 }];

    const asksFirst = computeKrakenChecksum(bids, asks, precision);
    const bidsFirst = crc32('995' + '200000000' + '1005' + '100000000');

    expect(asksFirst).not.toBe(bidsFirst);
  });

  it('only includes the top 10 levels per side', () => {
    const makeLevels = (count: number, startPrice: number, step: number): OrderBookLevel[] =>
      Array.from({ length: count }, (_, i) => ({
        price: startPrice + i * step,
        quantity: 1,
      }));

    const asks11 = makeLevels(11, 100, 1);
    const bids11 = makeLevels(11, 99, -1);

    expect(computeKrakenChecksum(bids11, asks11, precision)).toBe(
      computeKrakenChecksum(bids11.slice(0, 10), asks11.slice(0, 10), precision),
    );
  });
});
