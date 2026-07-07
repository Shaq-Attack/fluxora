import type { ConnectionStatus, Ticker, Trade } from '@fluxora/types';
import { KrakenConnection } from './connection';
import { parseKrakenMessage } from './parser';

// Keyed by "symbol:trade_id". Oldest entries evicted (FIFO) once the Set reaches this size.
const MAX_SEEN_TRADE_IDS = 1_000;

interface KrakenAdapterOptions {
  symbols: string[];
  onTicker: (tickers: Ticker[]) => void;
  onTrade: (trades: Trade[]) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onLatency?: (ms: number) => void;
}

export class KrakenAdapter {
  private readonly connection: KrakenConnection;
  private readonly seenTradeIds = new Set<string>();

  constructor(options: KrakenAdapterOptions) {
    this.connection = new KrakenConnection({
      symbols: options.symbols,
      onMessage: (raw) => {
        const message = parseKrakenMessage(raw);
        if (message === null || message.kind === 'ignore') return;
        try {
          if (message.kind === 'ticker') options.onTicker(message.data);
          if (message.kind === 'trade') {
            const fresh = message.data.filter((t) => !this.seenTradeIds.has(`${t.symbol}:${t.id}`));
            if (fresh.length === 0) return;
            // Evict oldest entries (Set preserves insertion order) to make room without losing recent IDs.
            const evictCount = this.seenTradeIds.size + fresh.length - MAX_SEEN_TRADE_IDS;
            if (evictCount > 0) {
              const iter = this.seenTradeIds.values();
              for (let i = 0; i < evictCount; i++) {
                const { value, done } = iter.next();
                if (done) break;
                this.seenTradeIds.delete(value);
              }
            }
            for (const t of fresh) this.seenTradeIds.add(`${t.symbol}:${t.id}`);
            options.onTrade(fresh);
          }
        } catch (err: unknown) {
          console.error('[KrakenAdapter] callback error:', err);
        }
      },
      onStatusChange: options.onStatusChange,
      onLatency: (ms) => options.onLatency?.(ms),
    });
  }

  start(): void {
    this.connection.connect();
  }

  stop(): void {
    this.connection.disconnect();
  }

  setSymbols(symbols: string[]): void {
    this.connection.setSymbols(symbols);
  }
}
