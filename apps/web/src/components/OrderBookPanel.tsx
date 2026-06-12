import { useOrderBookPanel } from './useOrderBookPanel';
import { formatPrice, formatQuantity } from '../lib/format';

interface OrderBookPanelProps {
  symbol: string;
}

export function OrderBookPanel({ symbol }: OrderBookPanelProps): JSX.Element {
  const orderBook = useOrderBookPanel(symbol);

  if (orderBook === undefined) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
        <p className="text-xs text-gray-600">Waiting for Order Book data…</p>
      </div>
    );
  }

  const { bids: bidsWithDepth, asks: asksWithDepth } = orderBook;

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 px-3 py-2">
        <span className="text-sm font-semibold text-gray-300">{symbol} Order Book</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-gray-800">
        <div className="bg-gray-900">
          <div className="grid grid-cols-2 gap-1 px-3 py-1">
            <span className="text-xs text-gray-500">Price</span>
            <span className="text-right text-xs text-gray-500">Size</span>
          </div>
          {bidsWithDepth.map((level) => (
            <div key={level.price} className="relative px-3 py-0.5">
              {/* depth bar — runtime width, no static Tailwind equivalent */}
              <div
                className="absolute inset-y-0 left-0 bg-green-500/10"
                style={{ width: `${level.depthPct}%` }}
              />
              <div className="relative z-10 grid grid-cols-2 gap-1">
                <span className="font-mono text-xs tabular-nums text-green-400">
                  {formatPrice(level.price)}
                </span>
                <span className="text-right font-mono text-xs tabular-nums text-gray-400">
                  {formatQuantity(level.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-900">
          <div className="grid grid-cols-2 gap-1 px-3 py-1">
            <span className="text-xs text-gray-500">Price</span>
            <span className="text-right text-xs text-gray-500">Size</span>
          </div>
          {asksWithDepth.map((level) => (
            <div key={level.price} className="relative px-3 py-0.5">
              {/* depth bar — runtime width, no static Tailwind equivalent */}
              <div
                className="absolute inset-y-0 left-0 bg-red-500/10"
                style={{ width: `${level.depthPct}%` }}
              />
              <div className="relative z-10 grid grid-cols-2 gap-1">
                <span className="font-mono text-xs tabular-nums text-red-400">
                  {formatPrice(level.price)}
                </span>
                <span className="text-right font-mono text-xs tabular-nums text-gray-400">
                  {formatQuantity(level.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
