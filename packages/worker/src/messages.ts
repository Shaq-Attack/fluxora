import type { Exchange, OrderBook } from '@fluxora/types';
import type { ChecksumPrecision } from './crc32';

export type WorkerInboundMessage =
  | {
      type: 'SUBSCRIBE';
      symbol: string;
      exchange: Exchange;
      /** Levels to retain per side; the book is truncated to this after each delta. */
      depth?: number;
      /** Required to validate exchange checksums; validation is skipped when absent. */
      checksumPrecision?: ChecksumPrecision;
    }
  | { type: 'UNSUBSCRIBE'; symbol: string; exchange: Exchange }
  | {
      type: 'SNAPSHOT';
      symbol: string;
      exchange: Exchange;
      payload: OrderBook;
    }
  | {
      type: 'DELTA';
      symbol: string;
      exchange: Exchange;
      payload: {
        bids: [number, number][];
        asks: [number, number][];
        checksum?: number;
        sequenceId?: number;
      };
    };

export type WorkerOutboundMessage =
  | { type: 'ORDER_BOOK_UPDATE'; payload: OrderBook }
  | { type: 'CHECKSUM_MISMATCH'; symbol: string; exchange: Exchange }
  | { type: 'SEQUENCE_GAP'; symbol: string; exchange: Exchange; expected: number; received: number }
  | { type: 'ERROR'; message: string };
