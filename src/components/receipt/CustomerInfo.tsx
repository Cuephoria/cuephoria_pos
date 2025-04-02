
import React from 'react';
import { Customer } from '@/context/POSContext';
import { CalendarCheck } from 'lucide-react';

interface CustomerInfoProps {
  customer: Customer;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    
    // Handle both string and Date objects
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  return (
    <div className="mb-4">
      <p className="font-medium text-sm">Customer: {customer.name}</p>
      <p className="text-xs text-gray-600">{customer.phone}</p>
      {customer.isMember && (
        <p className="text-xs flex items-center text-cuephoria-purple mt-1">
          <CalendarCheck className="h-3 w-3 mr-1" />
          <span>Premium Member</span>
          {customer.membershipExpiryDate && (
            <span className="ml-1">until {formatDate(customer.membershipExpiryDate)}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default CustomerInfo;
