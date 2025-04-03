
import React from 'react';
import { Bill } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';

interface ReceiptSummaryProps {
  bill: Bill;
}

const ReceiptSummary: React.FC<ReceiptSummaryProps> = ({ bill }) => {
  return (
    <div className="space-y-1 text-sm">
      <div className="receipt-item">
        <span>Subtotal:</span>
        <CurrencyDisplay amount={bill.subtotal} />
      </div>
      
      {bill.discount > 0 && (
        <div className="receipt-item text-cuephoria-purple">
          <span>
            Discount {bill.discountType === 'percentage' ? `(${bill.discount}%)` : ''}:
          </span>
          <CurrencyDisplay amount={bill.discountValue} className="text-cuephoria-purple" />
        </div>
      )}
      
      {bill.loyaltyPointsUsed > 0 && (
        <div className="receipt-item text-cuephoria-orange">
          <span>Loyalty Points:</span>
          <CurrencyDisplay amount={bill.loyaltyPointsUsed} className="text-cuephoria-orange" />
        </div>
      )}
      
      <div className="receipt-total flex justify-between font-bold">
        <span>Total:</span>
        <CurrencyDisplay amount={bill.total} />
      </div>
      
      <div className="text-xs text-gray-600 mt-4">
        <div>Payment Method: {bill.paymentMethod.toUpperCase()}</div>
        {bill.loyaltyPointsEarned > 0 && (
          <div className="mt-1">Points Earned: {bill.loyaltyPointsEarned}</div>
        )}
      </div>
    </div>
  );
};

export default ReceiptSummary;
