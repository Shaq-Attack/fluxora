import type { Timeframe } from '@fluxora/types';

export const SYMBOL_TO_PAIR: Record<string, string> = {
  'BTC/USD': 'XBTUSD',
  'ETH/USD': 'ETHUSD',
};

export const TIMEFRAME_TO_INTERVAL: Record<Timeframe, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  '1d': 1440,
};
