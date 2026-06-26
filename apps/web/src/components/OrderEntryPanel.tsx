import type { OrderSide, OrderType } from '@fluxora/types';
import { formatPrice } from '../lib/format';
import { useOrderEntryPanel } from './useOrderEntryPanel';

interface OrderEntryPanelProps {
  symbol: string;
}

const QUICK_FILL_PCTS: { label: string; value: number }[] = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
];

export function OrderEntryPanel({ symbol }: OrderEntryPanelProps): JSX.Element {
  const { form, handlers, data } = useOrderEntryPanel(symbol);
  const { side, orderType, qty, limitPrice, error, successMsg } = form;
  const {
    handleSideChange,
    handleOrderTypeChange,
    handleQtyChange,
    handleLimitPriceChange,
    handleQuickFill,
    handleSubmit,
  } = handlers;
  const { ticker, cashBalance, positionQty, isSubmitDisabled } = data;

  const sideButtonClass = (btn: OrderSide): string => {
    if (btn === 'buy') return side === 'buy' ? 'bg-green-600 text-white' : 'bg-surface-strong text-dim';
    return side === 'sell' ? 'bg-red-600 text-white' : 'bg-surface-strong text-dim';
  };

  const typeButtonClass = (btn: OrderType): string =>
    orderType === btn ? 'bg-blue-700 text-white' : 'bg-surface-strong text-dim';

  const submitClass =
    side === 'buy'
      ? 'w-full rounded bg-green-600 py-1.5 text-sm font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40'
      : 'w-full rounded bg-red-600 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-4">
      <h2 className="mb-3 pr-9 text-sm font-semibold text-muted">{symbol} Order Entry</h2>

      <div className="mb-3 flex gap-1">
        <button
          className={`flex-1 rounded px-2 py-1 text-xs font-semibold ${sideButtonClass('buy')}`}
          onClick={() => handleSideChange('buy')}
          type="button"
        >
          Buy
        </button>
        <button
          className={`flex-1 rounded px-2 py-1 text-xs font-semibold ${sideButtonClass('sell')}`}
          onClick={() => handleSideChange('sell')}
          type="button"
        >
          Sell
        </button>
      </div>

      <div className="mb-3 flex gap-1">
        <button
          className={`flex-1 rounded px-2 py-1 text-xs ${typeButtonClass('market')}`}
          onClick={() => handleOrderTypeChange('market')}
          type="button"
        >
          Market
        </button>
        <button
          className={`flex-1 rounded px-2 py-1 text-xs ${typeButtonClass('limit')}`}
          onClick={() => handleOrderTypeChange('limit')}
          type="button"
        >
          Limit
        </button>
      </div>

      <div className="mb-2">
        <label className="mb-0.5 block text-xs text-dim">Quantity</label>
        <input
          className="w-full rounded border border-border-strong bg-surface-strong px-2 py-1 font-mono text-sm text-primary placeholder-subtle focus:outline-none focus:ring-1 focus:ring-border-strong"
          onChange={(e) => handleQtyChange(e.target.value)}
          placeholder="0.000000"
          type="number"
          value={qty}
        />
        {ticker !== undefined && (
          <div className="mt-1 flex gap-1">
            {QUICK_FILL_PCTS.map(({ label, value }) => (
              <button
                className="flex-1 rounded bg-surface-strong px-1 py-0.5 text-xs text-dim hover:bg-border"
                key={label}
                onClick={() => handleQuickFill(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {orderType === 'limit' && (
        <div className="mb-2">
          <label className="mb-0.5 block text-xs text-dim">Limit Price (USD)</label>
          <input
            className="w-full rounded border border-border-strong bg-surface-strong px-2 py-1 font-mono text-sm text-primary placeholder-subtle focus:outline-none focus:ring-1 focus:ring-border-strong"
            onChange={(e) => handleLimitPriceChange(e.target.value)}
            placeholder="0.00"
            type="number"
            value={limitPrice}
          />
        </div>
      )}

      {ticker !== undefined && (
        <p className="mb-2 text-xs text-dim">
          Last: <span className="font-mono text-muted">${formatPrice(ticker.price)}</span>
          {' · '}
          {side === 'buy'
            ? `Cash: $${formatPrice(cashBalance)}`
            : `Position: ${positionQty.toFixed(6)}`}
        </p>
      )}

      <button
        className={submitClass}
        disabled={isSubmitDisabled}
        onClick={handleSubmit}
        type="button"
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
      </button>

      {error !== null && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {successMsg !== null && <p className="mt-1 text-xs text-green-400">{successMsg}</p>}
    </div>
  );
}
