
import React from 'react';
import { Customer, MembershipTier } from '@/types/pos.types';

interface CustomerInfoProps {
  customer: Customer;
}

// Helper function to format membership tier for display
const formatMembershipTier = (tier: MembershipTier): string => {
  switch (tier) {
    case 'introWeekly2Pax':
      return 'Introductory Weekly Pass - 8 ball (2 Pax)';
    case 'introWeekly4Pax':
      return 'Introductory Weekly Pass - 8 Ball (4 Pax)';
    case 'introWeeklyPS5':
      return 'Introductory Weekly Pass - PS5 Gaming';
    case 'introWeeklyCombo':
      return 'Introductory Weekly Pass - Combo';
    case 'none':
    default:
      return 'No Membership';
  }
};

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  return (
    <div className="mb-4">
      <p className="font-medium text-sm">Customer: {customer.name}</p>
      <p className="text-xs text-gray-600">{customer.phone}</p>
      {customer.isMember && customer.membershipDetails && (
        <div className="text-xs text-cuephoria-purple mt-1">
          <p>Membership: {formatMembershipTier(customer.membershipDetails.tier)}</p>
          <p>
            Credit Hours: {customer.membershipDetails.creditHoursRemaining} hrs remaining
            {customer.membershipDetails.expiryDate && 
              ` (Expires: ${new Date(customer.membershipDetails.expiryDate).toLocaleDateString()})`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerInfo;
