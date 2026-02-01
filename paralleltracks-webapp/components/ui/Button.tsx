import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'min-h-[48px] px-6 py-3 border-4 border-pixel-border font-pixel shadow-pixel-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';

  const variantStyles = {
    primary: 'bg-pixel-accent border-pixel-error text-pixel-text hover:brightness-110',
    secondary: 'bg-pixel-bg-tertiary border-pixel-border text-pixel-text-secondary hover:brightness-110'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
