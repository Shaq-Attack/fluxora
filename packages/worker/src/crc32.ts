import type { OrderBookLevel } from '@fluxora/types';

const TABLE = buildTable();

function buildTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

export function crc32(str: string): number {
  let crc = 0xffffffff;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ TABLE[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ChecksumPrecision {
  /** Decimal places in the exchange's textual price representation (pair price increment). */
  price: number;
  /** Decimal places in the exchange's textual quantity representation (8 for Kraken spot). */
  qty: number;
}

/**
 * Kraken transmits e.g. qty 0.001 as "0.00100000"; the checksum is defined over
 * that textual form with the decimal point removed and leading zeros stripped.
 */
function checksumToken(value: number, decimals: number): string {
  return value.toFixed(decimals).replace('.', '').replace(/^0+/, '');
}

/**
 * Compute the Kraken v2 book checksum: CRC32 over the top 10 asks (ascending)
 * concatenated with the top 10 bids (descending) — asks first, per the spec.
 * https://docs.kraken.com/api/docs/guides/spot-ws-book-v2
 */
export function computeKrakenChecksum(
  bids: OrderBookLevel[],
  asks: OrderBookLevel[],
  precision: ChecksumPrecision,
): number {
  const tokens: string[] = [];
  for (const level of asks.slice(0, 10)) {
    tokens.push(checksumToken(level.price, precision.price));
    tokens.push(checksumToken(level.quantity, precision.qty));
  }
  for (const level of bids.slice(0, 10)) {
    tokens.push(checksumToken(level.price, precision.price));
    tokens.push(checksumToken(level.quantity, precision.qty));
  }
  return crc32(tokens.join(''));
}
