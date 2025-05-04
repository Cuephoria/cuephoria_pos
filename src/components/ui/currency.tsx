
import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showDecimals?: boolean;
  showPrefix?: boolean;
}

export const formatCurrency = (amount: number, showDecimals: boolean = false, showPrefix: boolean = true): string => {
  return showPrefix
    ? (showDecimals 
        ? `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `₹${Math.round(amount).toLocaleString('en-IN')}`)
    : (showDecimals
        ? `${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `${Math.round(amount).toLocaleString('en-IN')}`);
};

export function CurrencyDisplay({ 
  amount, 
  className, 
  showDecimals = false,
  showPrefix = true 
}: CurrencyDisplayProps) {
  const formattedAmount = formatCurrency(amount, showDecimals, showPrefix);
    
  return (
    <span className={cn(showPrefix ? "" : "indian-rupee", className)}>
      {formattedAmount}
    </span>
  );
}
