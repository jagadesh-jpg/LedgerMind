import React from 'react';
import { cn } from '../../lib/utils';
import { InvoiceStatus, ExceptionType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'exception' | 'neutral' | 'demo';
  status?: InvoiceStatus;
  exception?: ExceptionType | 'None';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  status,
  exception,
  className,
}) => {
  let styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'status' && status) {
    switch (status) {
      case 'Needs Review':
        styleClasses = 'bg-amber-950/40 text-amber-300 border-amber-500/40 font-medium';
        break;
      case 'Resolved':
        styleClasses = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-medium';
        break;
      case 'Processing':
        styleClasses = 'bg-slate-800 text-slate-300 border-slate-600/60 font-medium';
        break;
    }
  } else if (variant === 'exception' && exception) {
    if (exception === 'None') {
      styleClasses = 'bg-slate-900/80 text-slate-400 border-slate-800';
    } else if (exception === 'Possible Duplicate' || exception === 'Unit Price Mismatch') {
      styleClasses = 'bg-rose-950/40 text-rose-300 border-rose-500/40 font-medium';
    } else {
      styleClasses = 'bg-amber-950/40 text-amber-300 border-amber-500/40 font-medium';
    }
  } else if (variant === 'demo') {
    styleClasses = 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40 font-semibold tracking-wider uppercase text-[10px]';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium whitespace-nowrap',
        styleClasses,
        className
      )}
    >
      {children}
    </span>
  );
};

