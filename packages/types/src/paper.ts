export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'filled' | 'cancelled';

export interface PaperOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  limitPrice?: number;
  status: OrderStatus;
  avgFillPrice?: number;
  createdAt: number;
  filledAt?: number;
}

export interface PaperPosition {
  symbol: string;
  qty: number;
  avgEntryPrice: number;
}
