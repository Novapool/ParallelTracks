import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-pixel-bg-secondary border-4 border-pixel-border shadow-pixel scanlines relative p-6 ${className}`}>
      {children}
    </div>
  );
}
