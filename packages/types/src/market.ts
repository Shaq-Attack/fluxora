import type { Exchange } from './exchange';

export interface Ticker {
  symbol: string;
  exchange: Exchange;
  bid: number;
  ask: number;
  price: number;
  volume24h: number;
  change24h: number;
  changePercent24h: number;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  symbol: string;
  exchange: Exchange;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  checksum?: number;
  sequenceId?: number;
}

export interface Trade {
  id: string;
  symbol: string;
  exchange: Exchange;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
