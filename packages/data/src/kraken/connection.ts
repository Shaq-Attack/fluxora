import { EXCHANGE_CONFIGS } from '@fluxora/types';
import type { ConnectionStatus } from '@fluxora/types';
import { diffSymbols } from './symbolDiff';

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const JITTER_FACTOR = 0.2;
const PING_INTERVAL_MS = 10_000;

function subscriptionMessage(method: 'subscribe' | 'unsubscribe', channel: 'ticker' | 'trade', symbols: string[]): string {
  return JSON.stringify({ method, params: { channel, symbol: symbols } });
}

export interface KrakenConnectionOptions {
  /** Symbols to subscribe to on connect. Call setSymbols() later to change the set. */
  symbols: string[];
  onMessage: (raw: string) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  /** Optional: receives the WebSocket ping→pong round-trip time in milliseconds. */
  onLatency?: (ms: number) => void;
}

export class KrakenConnection {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private backoffMs = INITIAL_BACKOFF_MS;
  private stopped = false;
  private lastStatus: ConnectionStatus | null = null;
  private pingReqId = 0;
  // Maps an outstanding ping req_id to its send timestamp (performance.now()).
  private readonly pendingPings = new Map<number, number>();
  private readonly options: KrakenConnectionOptions;
  private symbols: string[];

  constructor(options: KrakenConnectionOptions) {
    this.options = options;
    this.symbols = [...options.symbols];
  }

  /**
   * Updates the subscribed symbol set. If connected, sends unsubscribe/subscribe
   * frames for just the delta; otherwise the new set takes effect on next connect.
   */
  setSymbols(next: string[]): void {
    const { added, removed } = diffSymbols(this.symbols, next);
    this.symbols = [...next];
    if (added.length === 0 && removed.length === 0) return;
    if (this.ws === null || this.ws.readyState !== WebSocket.OPEN) return;

    if (removed.length > 0) {
      this.ws.send(subscriptionMessage('unsubscribe', 'ticker', removed));
      this.ws.send(subscriptionMessage('unsubscribe', 'trade', removed));
    }
    if (added.length > 0) {
      this.ws.send(subscriptionMessage('subscribe', 'ticker', added));
      this.ws.send(subscriptionMessage('subscribe', 'trade', added));
    }
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
    this.stopPinging();
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws !== null) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      if (this.ws.readyState < WebSocket.CLOSING) {
        this.ws.close();
      }
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
      if (this.symbols.length > 0) {
        ws.send(subscriptionMessage('subscribe', 'ticker', this.symbols));
        ws.send(subscriptionMessage('subscribe', 'trade', this.symbols));
      }
      this.startPinging(ws);
    };

    ws.onmessage = (event: MessageEvent<unknown>) => {
      if (typeof event.data !== 'string') return;
      // Pong frames are control messages, not market data: measure latency and
      // do not forward them to the message parser.
      if (this.tryHandlePong(event.data)) return;
      this.options.onMessage(event.data);
    };

    ws.onerror = () => {
      this.emitStatus('error');
    };

    ws.onclose = () => {
      // Guard prevents a stale onclose from wiping a replacement socket created by a second openSocket() call.
      if (this.ws === ws) this.ws = null;
      // Stop pinging and drop outstanding ping timestamps so a reconnect does not
      // emit a bogus latency from a ping sent on the previous socket.
      this.stopPinging();
      if (!this.stopped) {
        this.emitStatus('disconnected');
        this.scheduleReconnect();
      }
    };
  }

  private startPinging(ws: WebSocket): void {
    this.stopPinging();
    this.pingTimer = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const reqId = ++this.pingReqId;
      this.pendingPings.set(reqId, performance.now());
      ws.send(JSON.stringify({ method: 'ping', req_id: reqId }));
    }, PING_INTERVAL_MS);
  }

  private stopPinging(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.pendingPings.clear();
  }

  /**
   * Detects a Kraken v2 pong frame (`{"method":"pong","req_id":N}`), reports the
   * round-trip latency for the matching ping, and returns whether the frame was
   * a pong. A malformed control frame is swallowed and treated as a non-pong.
   */
  private tryHandlePong(raw: string): boolean {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return false;
    }
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as { method?: unknown }).method !== 'pong'
    ) {
      return false;
    }
    const reqId = (parsed as { req_id?: unknown }).req_id;
    if (typeof reqId !== 'number') return true;
    const sentAt = this.pendingPings.get(reqId);
    if (sentAt !== undefined) {
      this.pendingPings.delete(reqId);
      this.options.onLatency?.(performance.now() - sentAt);
    }
    return true;
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
