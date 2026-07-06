import { useEffect, useRef, useState } from 'react';

type PriceDirection = 'up' | 'down' | 'neutral';

interface PriceChangeProps {
  value: string;
  direction?: PriceDirection;
  /** Flash the background green/red when the numeric value ticks up/down. */
  flash?: boolean;
  className?: string;
}

const DIRECTION_CLASS: Record<PriceDirection, string> = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-primary',
};

interface FlashState {
  direction: 'up' | 'down';
  seq: number;
}

function parseNumeric(value: string): number | null {
  const numeric = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

export function PriceChange({
  value,
  direction = 'neutral',
  flash = true,
  className = '',
}: PriceChangeProps): JSX.Element {
  const prevValueRef = useRef(value);
  const [flashState, setFlashState] = useState<FlashState | null>(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    if (!flash || prev === value) return;

    const prevNumeric = parseNumeric(prev);
    const nextNumeric = parseNumeric(value);
    if (prevNumeric === null || nextNumeric === null || prevNumeric === nextNumeric) return;

    setFlashState((state) => ({
      direction: nextNumeric > prevNumeric ? 'up' : 'down',
      seq: (state?.seq ?? 0) + 1,
    }));
  }, [value, flash]);

  const flashClass =
    flashState === null
      ? ''
      : flashState.direction === 'up'
        ? 'motion-safe:animate-flash-up'
        : 'motion-safe:animate-flash-down';

  return (
    // Remounting on each tick (key=seq) restarts the CSS animation
    <span
      key={flashState?.seq ?? 0}
      className={`rounded-sm font-mono tabular-nums ${DIRECTION_CLASS[direction]} ${flashClass} ${className}`}
    >
      {value}
    </span>
  );
}
