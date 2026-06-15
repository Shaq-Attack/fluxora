interface StatDisplayProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export function StatDisplay({ label, value, valueClassName = '' }: StatDisplayProps): JSX.Element {
  return (
    <div>
      <p className="text-xs text-dim">{label}</p>
      <p className={`font-mono text-sm tabular-nums text-primary ${valueClassName}`}>{value}</p>
    </div>
  );
}
