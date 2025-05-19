import React from 'react';
import { Bill } from '@/types/pos.types';

interface ReceiptHeaderProps {
  bill: Bill;
}

const ReceiptHeader: React.FC<ReceiptHeaderProps> = ({ bill }) => {
  return (
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
  );
};

export default ReceiptHeader;
