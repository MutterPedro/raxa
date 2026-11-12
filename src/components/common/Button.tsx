import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'lg' | 'md' | 'sm';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-700 text-brand-50 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500',
  secondary: 'border border-line-strong bg-surface-raised text-ink hover:bg-surface-sunken',
  ghost: 'bg-transparent text-ink hover:bg-surface-sunken',
  danger: 'bg-danger text-surface hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'h-12 px-5 text-base',
  md: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
};

const baseClasses =
  'inline-flex items-center justify-center font-semibold rounded-[var(--radius-field)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className = '', ...rest }) => (
  <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...rest} />
);

export default Button;
