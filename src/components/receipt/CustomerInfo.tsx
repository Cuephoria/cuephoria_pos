
import React from 'react';
import { Customer } from '@/context/POSContext';
import { CalendarCheck, Award, Clock, Calendar } from 'lucide-react';

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
  
  const isMembershipActive = () => {
    if (!customer.isMember || !customer.membershipExpiryDate) return false;
    const expiryDate = new Date(customer.membershipExpiryDate);
    return expiryDate > new Date();
  };

  const getMembershipType = () => {
    if (!customer.isMember) return 'Non-Member';
    
    const duration = customer.membershipDuration || 
                    (customer.membershipPlan?.toLowerCase().includes('weekly') ? 'weekly' : 
                     customer.membershipPlan?.toLowerCase().includes('monthly') ? 'monthly' : '');
    
    return duration.charAt(0).toUpperCase() + duration.slice(1) + ' Member';
  };

  return (
    <div className="mb-4">
      <p className="font-medium text-sm">Customer: {customer.name}</p>
      <p className="text-xs text-gray-600">{customer.phone}</p>
      
      <div className="mt-2 border-t pt-2">
        <p className="text-xs flex items-center">
          <Award className="h-3 w-3 mr-1" />
          <span className="font-medium">Membership Status:</span> 
          <span className={`ml-1 ${isMembershipActive() ? 'text-green-600' : 'text-red-600'}`}>
            {isMembershipActive() ? getMembershipType() : 'Inactive'}
          </span>
        </p>
        
        {customer.membershipPlan && (
          <p className="text-xs flex items-center mt-1">
            <span className="font-medium">Plan Name:</span>
            <span className="ml-1">{customer.membershipPlan}</span>
          </p>
        )}
        
        {customer.membershipStartDate && (
          <p className="text-xs flex items-center mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            <span className="font-medium">Start Date:</span>
            <span className="ml-1">{formatDate(customer.membershipStartDate)}</span>
          </p>
        )}
        
        {customer.membershipExpiryDate && (
          <p className="text-xs flex items-center mt-1">
            <CalendarCheck className="h-3 w-3 mr-1" />
            <span className="font-medium">End Date:</span>
            <span className="ml-1">{formatDate(customer.membershipExpiryDate)}</span>
          </p>
        )}
        
        {customer.membershipHoursLeft !== undefined && (
          <p className="text-xs flex items-center mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span className="font-medium">Hours Remaining:</span>
            <span className="ml-1">{customer.membershipHoursLeft}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomerInfo;
