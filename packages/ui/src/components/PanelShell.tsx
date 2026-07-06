import type { ReactNode } from 'react';

interface PanelShellProps {
  title?: string;
  children: ReactNode;
  className?: string;
  /** Fill the parent flex column (min-h-0 flex-1) instead of sizing to content. */
  fill?: boolean;
}

export function PanelShell({
  title,
  children,
  className = '',
  fill = false,
}: PanelShellProps): JSX.Element {
  const fillClasses = fill ? 'flex min-h-0 flex-1 flex-col ' : '';
  return (
    <div className={`rounded-lg border border-border bg-surface-elevated ${fillClasses}${className}`}>
      {title !== undefined && (
        <div className="shrink-0 border-b border-border px-3 py-2">
          <h2 className="text-sm font-semibold text-muted">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}
