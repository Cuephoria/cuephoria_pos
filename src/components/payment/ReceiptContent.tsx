
import React from 'react';
import { Bill, Customer } from '@/context/POSContext';

interface ReceiptContentProps {
  bill: Bill;
  customer: Customer;
  receiptRef: React.RefObject<HTMLDivElement>;
}

const ReceiptContent: React.FC<ReceiptContentProps> = ({ 
  bill, 
  customer,
  receiptRef
}) => {
  return (
    <div ref={receiptRef} className="bg-white p-6 rounded-lg shadow-sm text-black">
      <div className="receipt-header">
        <h1 className="text-lg font-bold mb-1 font-heading">CUEPHORIA</h1>
        <p className="text-sm">Gaming Lounge & Café</p>
        <p className="text-xs text-gray-600 mt-2">
          Receipt #{bill.id.substring(0, 6).toUpperCase()}
        </p>
        <p className="text-xs text-gray-600">
          {new Date(bill.createdAt).toLocaleString()}
        </p>
      </div>
      
      <div className="mb-4">
        <p className="font-medium text-sm">Customer: {customer.name}</p>
        <p className="text-xs text-gray-600">{customer.phone}</p>
      </div>
      
      <div className="space-y-1 mb-4">
        <div className="text-sm font-medium border-b pb-1 mb-2">Items</div>
        {bill.items.map((item, index) => (
          <div key={index} className="receipt-item text-sm">
            <div>
              <span>{item.name}</span>
              {item.quantity > 1 && <span className="text-gray-600"> x{item.quantity}</span>}
            </div>
            <span>₹{item.total.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
      
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
      
      <div className="text-center text-xs text-gray-600 mt-6 pt-4 border-t">
        <p>Thank you for visiting Cuephoria!</p>
        <p>We hope to see you again soon.</p>
      </div>
    </div>
  );
};

export default ReceiptContent;
