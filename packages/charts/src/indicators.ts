import type { Time } from 'lightweight-charts';
import type { Candle } from '@fluxora/types';

export interface IndicatorConfig {
  vwap: boolean;
  emaPeriod: number | null;
}

export type IndicatorPoint = { time: Time; value: number };

export function computeVwap(candles: Candle[]): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  let cumulativeTypicalPriceVolume = 0;
  let cumulativeVolume = 0;

  for (const candle of candles) {
    if (candle.volume === 0) continue;
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativeTypicalPriceVolume += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;
    result.push({
      time: candle.time as unknown as Time,
      value: cumulativeTypicalPriceVolume / cumulativeVolume,
    });
  }

  return result;
}

export function computeEma(candles: Candle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];

  const result: IndicatorPoint[] = [];
  const k = 2 / (period + 1);

  // Seed with SMA of the first `period` bars
  let ema = candles.slice(0, period).reduce((sum, c) => sum + c.close, 0) / period;
  result.push({ time: candles[period - 1].time as unknown as Time, value: ema });

  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    result.push({ time: candles[i].time as unknown as Time, value: ema });
  }

  return result;
}
