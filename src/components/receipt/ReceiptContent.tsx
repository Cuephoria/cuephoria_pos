
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
  // Check if bill is valid
  if (!bill || !bill.id) {
    return (
      <div ref={receiptRef} className="p-6 text-black max-h-[calc(100vh-250px)] overflow-auto">
        <div className="text-center py-8">
          <h3 className="text-xl font-bold">Error: Invalid Bill Data</h3>
          <p className="mt-2">Unable to display receipt. Bill information is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={receiptRef} className="p-6 text-black max-h-[calc(100vh-250px)] overflow-auto">
      <ReceiptHeader bill={bill} />
      <CustomerInfo customer={customer} />
      <ReceiptItems bill={bill} />
      <ReceiptSummary bill={bill} />
      <ReceiptFooter />
    </div>
  );
};

export default ReceiptContent;
