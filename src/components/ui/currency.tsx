
import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  return (
    <span className={cn("indian-rupee", className)}>
      {amount.toLocaleString('en-IN')}
    </span>
  );
}
