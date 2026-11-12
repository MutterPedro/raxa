import React from 'react';

const LoadingGauge: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center text-brand-700 dark:text-brand-400" role="status">
      <span className="sr-only">Carregando…</span>
      <svg viewBox="0 0 32 32" width="50" height="50">
        <circle cx="8" cy="8" r="4.6" className="fill-current" />
        <circle cx="24" cy="8" r="4.6" className="fill-current" />
        <circle cx="8" cy="24" r="4.6" className="fill-current" />
        <circle cx="24" cy="24" r="4.6" className="fill-current" />
        <circle cx="16" cy="16" r="5.4" className="fill-brand-500 animate-pulse motion-reduce:animate-none" />
      </svg>
    </div>
  );
};

export default LoadingGauge;
