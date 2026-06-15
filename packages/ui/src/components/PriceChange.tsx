type PriceDirection = 'up' | 'down' | 'neutral';

interface PriceChangeProps {
  value: string;
  direction?: PriceDirection;
  className?: string;
}

const DIRECTION_CLASS: Record<PriceDirection, string> = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-primary',
};

export function PriceChange({
  value,
  direction = 'neutral',
  className = '',
}: PriceChangeProps): JSX.Element {
  return (
    <span className={`font-mono tabular-nums ${DIRECTION_CLASS[direction]} ${className}`}>
      {value}
    </span>
  );
}
