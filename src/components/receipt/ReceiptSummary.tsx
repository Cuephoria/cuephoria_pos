
import React from 'react';
import { Bill } from '@/context/POSContext';

interface ReceiptSummaryProps {
  bill: Bill;
}

const ReceiptSummary: React.FC<ReceiptSummaryProps> = ({ bill }) => {
  return (
    <div className="space-y-1 text-sm">
      <div className="receipt-item">
        <span>Subtotal:</span>
        <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
      </div>
      
      {bill.discount > 0 && (
        <div className="receipt-item text-cuephoria-purple">
          <span>
            Discount {bill.discountType === 'percentage' ? `(${bill.discount}%)` : ''}:
          </span>
          <span>-₹{bill.discountValue.toLocaleString('en-IN')}</span>
        </div>
      )}
      
      {bill.loyaltyPointsUsed > 0 && (
        <div className="receipt-item text-cuephoria-orange">
          <span>Loyalty Points:</span>
          <span>-₹{bill.loyaltyPointsUsed.toLocaleString('en-IN')}</span>
        </div>
      )}
      
      <div className="receipt-total flex justify-between font-bold">
        <span>Total:</span>
        <span>₹{bill.total.toLocaleString('en-IN')}</span>
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
