import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#1F2E4D] bg-[#111827]/80 backdrop-blur-sm shadow-lg shadow-black/20 transition-all duration-200',
        glass && 'bg-gradient-to-b from-[#162036]/90 to-[#101726]/90 border-[#26375A]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

