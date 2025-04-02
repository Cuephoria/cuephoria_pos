
import React from 'react';
import { Bill } from '@/context/POSContext';

interface ReceiptItemsProps {
  bill: Bill;
}

const ReceiptItems: React.FC<ReceiptItemsProps> = ({ bill }) => {
  return (
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
  );
};

export default ReceiptItems;
