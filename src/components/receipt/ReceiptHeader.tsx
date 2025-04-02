
import React from 'react';
import { Bill } from '@/context/POSContext';

interface ReceiptHeaderProps {
  bill: Bill;
}

const ReceiptHeader: React.FC<ReceiptHeaderProps> = ({ bill }) => {
  return (
    <div className="text-center border-b border-gray-200 pb-3 mb-4">
      <h1 className="text-2xl font-bold mb-1 font-heading">CUEPHORIA</h1>
      <p className="text-sm mb-3">Gaming Lounge & Café</p>
      <p className="text-sm">
        Receipt #{bill.id.substring(0, 6).toUpperCase()}
      </p>
      <p className="text-sm mb-1">
        {new Date(bill.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default ReceiptHeader;
