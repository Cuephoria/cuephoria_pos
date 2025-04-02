
import React from 'react';
import { Customer } from '@/types/pos.types';
import { format } from 'date-fns';

interface CustomerInfoProps {
  customer: Customer;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMM yyyy');
  };

  return (
    <div className="mb-4">
      <p className="font-medium text-sm">Customer: {customer.name}</p>
      <p className="text-xs text-gray-600">{customer.phone}</p>
      
      {customer.membership && (
        <div className="mt-2 text-xs border-t pt-1">
          <p className="font-medium">
            Membership: {getMembershipName(customer.membership.type)}
          </p>
          <p className="text-gray-600">
            Valid until: {formatDate(customer.membership.expiryDate)}
          </p>
          <p className="text-gray-600">
            Credit Hours: {customer.membership.creditHoursRemaining}/{customer.membership.originalCreditHours}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to get the friendly name of a membership type
const getMembershipName = (type: string): string => {
  switch (type) {
    case '8ball_2pax':
      return 'Weekly Pass - 8 Ball (2 Pax)';
    case '8ball_4pax':
      return 'Weekly Pass - 8 Ball (4 Pax)';
    case 'ps5':
      return 'Weekly Pass - PS5 Gaming';
    case 'combo':
      return 'Weekly Pass - Combo';
    default:
      return 'Unknown';
  }
};

export default CustomerInfo;
