
import React from 'react';
import { Customer } from '@/context/POSContext';

interface CustomerInfoProps {
  customer: Customer;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  return (
    <div className="mb-4">
      <p className="font-medium">Customer: {customer.name}</p>
      <p className="text-gray-600">{customer.phone}</p>
    </div>
  );
};

export default CustomerInfo;
