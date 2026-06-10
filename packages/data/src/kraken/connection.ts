import { EXCHANGE_CONFIGS } from '@fluxora/types';
import type { ConnectionStatus } from '@fluxora/types';

const SYMBOLS = ['BTC/USD', 'ETH/USD'] as const;

const SUBSCRIBE_TICKER = JSON.stringify({
  method: 'subscribe',
  params: { channel: 'ticker', symbol: [...SYMBOLS] },
});

const SUBSCRIBE_TRADE = JSON.stringify({
  method: 'subscribe',
  params: { channel: 'trade', symbol: [...SYMBOLS] },
});

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const JITTER_FACTOR = 0.2;

export interface KrakenConnectionOptions {
  onMessage: (raw: string) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

export class KrakenConnection {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = INITIAL_BACKOFF_MS;
  private stopped = false;
  private lastStatus: ConnectionStatus | null = null;
  private readonly options: KrakenConnectionOptions;

  constructor(options: KrakenConnectionOptions) {
    this.options = options;
  }

  private emitStatus(status: ConnectionStatus): void {
    if (this.lastStatus !== status) {
      this.lastStatus = status;
      this.options.onStatusChange(status);
    }
  }

  connect(): void {
    this.stopped = false;
    this.backoffMs = INITIAL_BACKOFF_MS;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.openSocket();
  }

  disconnect(): void {
    const wasActive = this.ws !== null || this.reconnectTimer !== null;
    this.stopped = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws !== null) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    if (wasActive) {
      this.emitStatus('disconnected');
    }
  }

  private openSocket(): void {
    this.emitStatus('connecting');
    const ws = new WebSocket(EXCHANGE_CONFIGS.kraken.wsEndpoint);
    this.ws = ws;

    ws.onopen = () => {
      this.backoffMs = INITIAL_BACKOFF_MS;
      this.emitStatus('connected');
      ws.send(SUBSCRIBE_TICKER);
      ws.send(SUBSCRIBE_TRADE);
    };

    ws.onmessage = (event: MessageEvent<unknown>) => {
      if (typeof event.data === 'string') {
        this.options.onMessage(event.data);
      }
    };

    ws.onerror = () => {
      this.emitStatus('error');
    };

    ws.onclose = () => {
      // Guard prevents a stale onclose from wiping a replacement socket created by a second openSocket() call.
      if (this.ws === ws) this.ws = null;
      if (!this.stopped) {
        this.emitStatus('disconnected');
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    const jitter = this.backoffMs * JITTER_FACTOR * (Math.random() * 2 - 1);
    const delay = Math.max(0, Math.min(this.backoffMs + jitter, MAX_BACKOFF_MS));
    this.backoffMs = Math.min(this.backoffMs * 2, MAX_BACKOFF_MS);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.stopped) {
        this.openSocket();
      }
    }, delay);
  }
}
