import React from 'react';

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...rest }) => (
  <div
    className={`rounded-[var(--radius-card)] bg-surface-raised p-4 shadow-card dark:border dark:border-line ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
