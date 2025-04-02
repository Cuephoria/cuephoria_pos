
import React from 'react';
import { Bill } from '@/context/POSContext';

interface ReceiptItemsProps {
  bill: Bill;
}

const ReceiptItems: React.FC<ReceiptItemsProps> = ({ bill }) => {
  return (
    <div className="mb-4">
      <div className="font-medium border-b border-gray-200 pb-2 mb-2">Items</div>
      {bill.items.map((item, index) => (
        <div key={index} className="flex justify-between mb-2">
          <div>
            {item.name} {item.quantity > 1 && <span>x{item.quantity}</span>}
          </div>
          <div>₹{item.total.toLocaleString('en-IN')}</div>
        </div>
      ))}
    </div>
  );
};

export default ReceiptItems;
