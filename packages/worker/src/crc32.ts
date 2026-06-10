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

/**
 * Compute the Kraken CRC32 checksum over the top 10 bid and ask levels.
 * Each price and quantity is converted to a string with the decimal point removed.
 * Kraken concatenates: bid0price + bid0qty + … + bid9price + bid9qty + ask0price + … + ask9qty
 */
export function computeKrakenChecksum(bids: OrderBookLevel[], asks: OrderBookLevel[]): number {
  const tokens: string[] = [];
  for (const level of bids.slice(0, 10)) {
    tokens.push(String(level.price).replace('.', ''));
    tokens.push(String(level.quantity).replace('.', ''));
  }
  for (const level of asks.slice(0, 10)) {
    tokens.push(String(level.price).replace('.', ''));
    tokens.push(String(level.quantity).replace('.', ''));
  }
  return crc32(tokens.join(''));
}
