import { formatPrice } from '../lib/format';
import { useWatchlistPanel } from './useWatchlistPanel';
import type { WatchlistRow } from './useWatchlistPanel';

function changeClass(change: number | null): string {
  if (change === null) return 'text-dim';
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
      className={`flex cursor-pointer items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-surface-strong ${
        row.isActive ? 'bg-surface-strong ring-1 ring-inset ring-border-strong' : ''
      }`}
      onClick={() => onSelect(row.symbol)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(row.symbol);
      }}
    >
      <span className="text-xs font-medium text-primary">{row.symbol}</span>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs tabular-nums text-muted">
          {row.lastPrice !== null ? `$${formatPrice(row.lastPrice)}` : '—'}
        </span>
        <span className={`font-mono text-xs tabular-nums ${changeClass(row.changePercent24h)}`}>
          {formatChange(row.changePercent24h)}
        </span>
        <button
          className="text-xs text-subtle hover:text-red-400"
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
    <div className="rounded-lg border border-border bg-surface-elevated p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted">Watchlist</h2>

      {rows.length === 0 ? (
        <p className="text-xs text-subtle">No symbols.</p>
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
          className="flex-1 rounded border border-border-strong bg-surface-strong px-2 py-1 text-xs text-primary placeholder-subtle focus:border-border-strong focus:outline-none"
          placeholder="Add symbol…"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          aria-label="Symbol to add"
        />
        <button
          className="rounded border border-border-strong bg-surface-strong px-3 py-1 text-xs text-muted hover:bg-border disabled:opacity-40"
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
