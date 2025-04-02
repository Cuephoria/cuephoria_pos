
import React, { ReactNode, RefObject } from 'react';
import { Bill, Customer } from '@/context/POSContext';
import ReceiptHeader from './ReceiptHeader';
import CustomerInfo from './CustomerInfo';
import ReceiptItems from './ReceiptItems';
import ReceiptSummary from './ReceiptSummary';
import ReceiptFooter from './ReceiptFooter';

interface ReceiptContentProps {
  bill: Bill;
  customer: Customer;
  receiptRef: RefObject<HTMLDivElement>;
}

const ReceiptContent: React.FC<ReceiptContentProps> = ({ bill, customer, receiptRef }) => {
  return (
    <div 
      ref={receiptRef} 
      className="p-8 text-black bg-white w-[85mm] mx-auto font-mono"
      id={`receipt-content-${bill.id}`}
      style={{ maxHeight: 'none', overflow: 'visible' }}
    >
      <ReceiptHeader bill={bill} />
      <CustomerInfo customer={customer} />
      <ReceiptItems bill={bill} />
      <ReceiptSummary bill={bill} />
      <ReceiptFooter />
    </div>
  );
};

export default ReceiptContent;
