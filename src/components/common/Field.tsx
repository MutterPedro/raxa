import React, { useId } from 'react';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

const Field: React.FC<FieldProps> = ({ label, hint, error, id: propId, className = '', ...rest }) => {
  const generatedId = useId();
  const inputId = propId || generatedId;

  const hintId = hint ? `hint-${inputId}` : undefined;
  const errorId = error ? `error-${inputId}` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className={`w-full h-10 rounded-[var(--radius-field)] border border-line bg-surface-raised px-3 text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500 ${
          error ? 'border-danger' : ''
        } ${className}`}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
