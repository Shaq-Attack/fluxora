type BadgeVariant = 'green' | 'amber' | 'red' | 'gray';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  pulse?: boolean;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  gray: 'bg-surface-strong text-dim border-border',
};

const DOT_CLASS: Record<BadgeVariant, string> = {
  green: 'bg-green-400',
  amber: 'bg-amber-400',
  red: 'bg-red-400',
  gray: 'bg-dim',
};

export function Badge({ variant, label, pulse = false }: BadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASS[variant]}`}
    >
      <span className={`size-1.5 rounded-full ${DOT_CLASS[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}
