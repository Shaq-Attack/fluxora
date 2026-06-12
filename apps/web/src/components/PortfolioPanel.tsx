import { formatPrice, formatQuantity } from '../lib/format';
import { usePortfolioPanel } from './usePortfolioPanel';
import type { PositionRow } from './usePortfolioPanel';

function pnlClass(pnl: number): string {
  return pnl >= 0 ? 'text-green-400' : 'text-red-400';
}

function formatPnl(pnl: number): string {
  const abs = formatPrice(Math.abs(pnl));
  return `${pnl >= 0 ? '+' : '-'}$${abs}`;
}

function PositionsTable({ rows }: { rows: PositionRow[] }): JSX.Element {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-800 text-left text-gray-500">
            <th className="pb-1 pr-3 font-medium">Symbol</th>
            <th className="pb-1 pr-3 font-medium">Qty</th>
            <th className="pb-1 pr-3 font-medium">Avg Entry</th>
            <th className="pb-1 pr-3 font-medium">Current</th>
            <th className="pb-1 pr-3 font-medium">Value</th>
            <th className="pb-1 font-medium">PnL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className="border-b border-gray-800/50">
              <td className="py-1 pr-3 font-medium text-gray-200">{row.symbol}</td>
              <td className="py-1 pr-3 font-mono tabular-nums text-gray-300">
                {formatQuantity(row.qty)}
              </td>
              <td className="py-1 pr-3 font-mono tabular-nums text-gray-300">
                ${formatPrice(row.avgEntryPrice)}
              </td>
              <td className="py-1 pr-3 font-mono tabular-nums text-gray-300">
                ${formatPrice(row.currentPrice)}
              </td>
              <td className="py-1 pr-3 font-mono tabular-nums text-gray-300">
                ${formatPrice(row.currentValue)}
              </td>
              <td className={`py-1 font-mono tabular-nums ${pnlClass(row.unrealisedPnl)}`}>
                {formatPnl(row.unrealisedPnl)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortfolioPanel(): JSX.Element {
  const { summary, positionRows, pendingOrders, handleCancelOrder, handleReset } =
    usePortfolioPanel();
  const { cashBalance, totalValue, totalUnrealisedPnl } = summary;
  const isEmpty = positionRows.length === 0 && pendingOrders.length === 0;

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">Paper Trading Portfolio</h2>
        <button
          className="text-xs text-gray-500 hover:text-red-400"
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-gray-500">Cash</p>
          <p className="font-mono text-sm tabular-nums text-white">${formatPrice(cashBalance)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="font-mono text-sm tabular-nums text-white">${formatPrice(totalValue)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Unrealised PnL</p>
          <p className={`font-mono text-sm tabular-nums ${pnlClass(totalUnrealisedPnl)}`}>
            {formatPnl(totalUnrealisedPnl)}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <p className="mt-3 text-xs text-gray-600">No open positions.</p>
      ) : (
        <>
          {positionRows.length > 0 && <PositionsTable rows={positionRows} />}

          {pendingOrders.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Pending Limit Orders</p>
              <div className="flex flex-col gap-1">
                {pendingOrders.map((order) => (
                  <div
                    className="flex items-center justify-between rounded bg-gray-800 px-2 py-1"
                    key={order.id}
                  >
                    <span className="font-mono text-xs tabular-nums text-gray-300">
                      <span
                        className={order.side === 'buy' ? 'text-green-400' : 'text-red-400'}
                      >
                        {order.side.toUpperCase()}
                      </span>
                      {' '}
                      {order.symbol} {formatQuantity(order.qty)} @{' '}
                      ${formatPrice(order.limitPrice)}
                    </span>
                    <button
                      className="ml-2 text-xs text-gray-500 hover:text-red-400"
                      onClick={() => handleCancelOrder(order.id)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
