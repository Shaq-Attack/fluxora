import type { ReactNode } from 'react';

interface PanelShellProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function PanelShell({ title, children, className = '' }: PanelShellProps): JSX.Element {
  return (
    <div className={`rounded-lg border border-border bg-surface-elevated ${className}`}>
      {title !== undefined && (
        <div className="border-b border-border px-3 py-2">
          <h2 className="text-sm font-semibold text-muted">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}
