import React from 'react';

const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...rest }) => (
  <div
    className={`animate-pulse rounded-[var(--radius-field)] bg-surface-sunken ${className}`}
    aria-hidden="true"
    {...rest}
  />
);

export default Skeleton;
