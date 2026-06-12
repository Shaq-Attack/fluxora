import type { Timeframe } from '@fluxora/types';

export const SYMBOL_TO_PAIR: Record<string, string> = {
  'BTC/USD': 'XBTUSD',
  'ETH/USD': 'ETHUSD',
};

/**
 * Decimal places Kraken uses in the textual price/qty fields of book messages,
 * required to reproduce the v2 book checksum (price = pair price increment
 * decimals; qty = 8 for spot pairs). Symbols missing here skip checksum
 * validation rather than false-mismatching into a REST resync loop.
 */
export const KRAKEN_CHECKSUM_PRECISION: Record<string, { price: number; qty: number }> = {
  'BTC/USD': { price: 1, qty: 8 },
  'ETH/USD': { price: 2, qty: 8 },
};

export const TIMEFRAME_TO_INTERVAL: Record<Timeframe, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  '1d': 1440,
};
