export type Exchange = 'kraken' | 'binance' | 'coinbase';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ExchangeConfig {
  name: Exchange;
  wsEndpoint: string;
  restEndpoint: string;
}

export const EXCHANGE_CONFIGS: Record<Exchange, ExchangeConfig> = {
  kraken: {
    name: 'kraken',
    wsEndpoint: 'wss://ws.kraken.com/v2',
    restEndpoint: 'https://api.kraken.com',
  },
  binance: {
    name: 'binance',
    wsEndpoint: 'wss://stream.binance.com:9443/ws',
    restEndpoint: 'https://api.binance.com',
  },
  coinbase: {
    name: 'coinbase',
    wsEndpoint: 'wss://ws-feed.exchange.coinbase.com',
    restEndpoint: 'https://api.exchange.coinbase.com',
  },
};
