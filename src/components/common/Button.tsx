import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  icon,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:opacity-50 disabled:pointer-events-none gap-2';

  const variants = {
    primary: 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-900/30 border border-teal-500/40',
    secondary: 'bg-[#18233C] hover:bg-[#202E4E] text-slate-200 border border-[#23355A]',
    outline: 'border border-[#23355A] hover:bg-[#152037] text-slate-300',
    ghost: 'hover:bg-[#18233C] text-slate-400 hover:text-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3.5 py-2',
    lg: 'text-base px-4 py-2.5',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

