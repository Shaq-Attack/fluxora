import { formatPrice } from '../lib/format';
import { useWatchlistPanel } from './useWatchlistPanel';
import type { WatchlistRow } from './useWatchlistPanel';

function changeClass(change: number | null): string {
  if (change === null) return 'text-gray-500';
  return change >= 0 ? 'text-green-400' : 'text-red-400';
}

function formatChange(change: number | null): string {
  if (change === null) return '—';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function WatchlistRowItem({
  row,
  onSelect,
  onRemove,
}: {
  row: WatchlistRow;
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
}): JSX.Element {
  return (
    <div
      className={`flex cursor-pointer items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-gray-800 ${
        row.isActive ? 'bg-gray-800 ring-1 ring-inset ring-gray-700' : ''
      }`}
      onClick={() => onSelect(row.symbol)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(row.symbol);
      }}
    >
      <span className="text-xs font-medium text-gray-200">{row.symbol}</span>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs tabular-nums text-gray-300">
          {row.lastPrice !== null ? `$${formatPrice(row.lastPrice)}` : '—'}
        </span>
        <span className={`font-mono text-xs tabular-nums ${changeClass(row.changePercent24h)}`}>
          {formatChange(row.changePercent24h)}
        </span>
        <button
          className="text-xs text-gray-600 hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(row.symbol);
          }}
          type="button"
          aria-label={`Remove ${row.symbol}`}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function WatchlistPanel(): JSX.Element {
  const {
    rows,
    inputValue,
    handleSelectSymbol,
    handleAddSymbol,
    handleRemoveSymbol,
    handleInputChange,
  } = useWatchlistPanel();

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') handleAddSymbol();
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-300">Watchlist</h2>

      {rows.length === 0 ? (
        <p className="text-xs text-gray-600">No symbols.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {rows.map((row) => (
            <WatchlistRowItem
              key={row.symbol}
              row={row}
              onSelect={handleSelectSymbol}
              onRemove={handleRemoveSymbol}
            />
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200 placeholder-gray-600 focus:border-gray-500 focus:outline-none"
          placeholder="Add symbol…"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          aria-label="Symbol to add"
        />
        <button
          className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-40"
          disabled={inputValue.trim().length === 0}
          onClick={handleAddSymbol}
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  );
}
