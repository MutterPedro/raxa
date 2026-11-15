import React, { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, hint, action }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-center">
    <h2 className="text-lg type-display text-ink">{title}</h2>
    {hint && <p className="max-w-xs text-ink-muted">{hint}</p>}
    {action}
  </div>
);

export default EmptyState;
