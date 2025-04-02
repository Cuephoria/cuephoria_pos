
import React from 'react';
import { Bill } from '@/context/POSContext';

interface ReceiptSummaryProps {
  bill: Bill;
}

const ReceiptSummary: React.FC<ReceiptSummaryProps> = ({ bill }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
      </div>
      
      {bill.discount > 0 && (
        <div className="flex justify-between text-cuephoria-purple">
          <span>
            Discount {bill.discountType === 'percentage' ? `(${bill.discount}%)` : ''}:
          </span>
          <span>-₹{bill.discountValue.toLocaleString('en-IN')}</span>
        </div>
      )}
      
      {bill.loyaltyPointsUsed > 0 && (
        <div className="flex justify-between text-cuephoria-orange">
          <span>Loyalty Points:</span>
          <span>-₹{bill.loyaltyPointsUsed.toLocaleString('en-IN')}</span>
        </div>
      )}
      
      <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
        <span>Total:</span>
        <span>₹{bill.total.toLocaleString('en-IN')}</span>
      </div>
      
      <div className="text-gray-600 mt-3">
        <div>Payment Method: {bill.paymentMethod.toUpperCase()}</div>
        {bill.loyaltyPointsEarned > 0 && (
          <div>Points Earned: {bill.loyaltyPointsEarned}</div>
        )}
      </div>
    </div>
  );
};

export default ReceiptSummary;
