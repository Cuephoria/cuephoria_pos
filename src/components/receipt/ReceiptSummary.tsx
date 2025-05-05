
import React from 'react';
import { CurrencyDisplay } from '@/components/ui/currency';

interface ReceiptSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'upi';
  pointsUsed: number;
}

const ReceiptSummary: React.FC<ReceiptSummaryProps> = ({ 
  subtotal, 
  discount, 
  total, 
  paymentMethod,
  pointsUsed
}) => {
  return (
    <div className="space-y-1 text-sm">
      <div className="receipt-item flex justify-between">
        <span>Subtotal:</span>
        <CurrencyDisplay amount={subtotal} />
      </div>
      
      {discount > 0 && (
        <div className="receipt-item text-cuephoria-purple flex justify-between">
          <span>Discount:</span>
          <CurrencyDisplay amount={discount} className="text-cuephoria-purple" />
        </div>
      )}
      
      {pointsUsed > 0 && (
        <div className="receipt-item text-cuephoria-orange flex justify-between">
          <span>Loyalty Points:</span>
          <CurrencyDisplay amount={pointsUsed} className="text-cuephoria-orange" />
        </div>
      )}
      
      <div className="receipt-total flex justify-between font-bold">
        <span>Total:</span>
        <CurrencyDisplay amount={total} />
      </div>
      
      <div className="text-xs text-gray-600 mt-4">
        <div>Payment Method: {paymentMethod.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default ReceiptSummary;
