import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'amber';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-900 text-slate-100 ring-slate-800',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-200',
    danger: 'bg-red-50 text-red-700 ring-red-600/20 border-red-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-600/20 border-sky-200',
    outline: 'border border-slate-300 text-slate-700 bg-white',
    amber: 'bg-amber-500/15 text-amber-500 ring-amber-500/30 font-mono',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
