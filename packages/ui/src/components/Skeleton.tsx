interface SkeletonProps {
  className?: string;
}

/** Pulsing placeholder block shown while panel data is loading. */
export function Skeleton({ className = '' }: SkeletonProps): JSX.Element {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-surface-strong ${className}`} />;
}
