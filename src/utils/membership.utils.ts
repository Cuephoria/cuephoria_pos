
import { Customer } from '@/types/pos.types';

/**
 * Determines if a customer's membership is currently active
 */
export const isMembershipActive = (customer: Customer): boolean => {
  if (!customer.isMember || !customer.membershipExpiryDate) return false;
  const expiryDate = new Date(customer.membershipExpiryDate);
  return expiryDate > new Date();
};

/**
 * Generates the text to display on a membership badge
 */
export const getMembershipBadgeText = (customer: Customer): string => {
  if (!customer.isMember) return 'Non-Member';
  
  const duration = customer.membershipDuration || 
                   (customer.membershipPlan?.toLowerCase().includes('weekly') ? 'Weekly' : 
                    customer.membershipPlan?.toLowerCase().includes('monthly') ? 'Monthly' : '');
  
  let tier = '';
  if (customer.membershipPlan) {
    if (customer.membershipPlan.includes('Silver')) {
      tier = 'Silver';
    } else if (customer.membershipPlan.includes('Gold')) {
      tier = 'Gold';
    } else if (customer.membershipPlan.includes('Platinum')) {
      tier = 'Platinum';
    }
  }
  
  let type = '';
  if (customer.membershipPlan) {
    if (customer.membershipPlan.includes('PS5')) {
      type = 'PS5';
    } else if (customer.membershipPlan.includes('8-Ball')) {
      type = '8-Ball';
    } else if (customer.membershipPlan.includes('Combo')) {
      type = 'Combo';
    } else if (customer.membershipPlan.includes('Ultimate')) {
      type = 'Ultimate';
    }
  }
  
  return `${tier} ${type} ${duration}`;
};

/**
 * Gets the appropriate color class for hours left indicator
 */
export const getHoursLeftColor = (hoursLeft: number | undefined): string => {
  if (hoursLeft === undefined) return '';
  
  if (hoursLeft <= 0) return 'text-red-600';
  if (hoursLeft < 2) return 'text-orange-500';
  return 'text-green-600';
};

/**
 * Check membership validity
 */
export const checkMembershipValidityInternal = (customer: Customer): boolean => {
  if (!customer.isMember) return false;
  
  // Check expiry date
  if (customer.membershipExpiryDate) {
    const expiryDate = new Date(customer.membershipExpiryDate);
    if (expiryDate < new Date()) return false;
  }
  
  // Check hours left if applicable
  if (customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft <= 0) {
    return false;
  }
  
  return true;
};

/**
 * Deduct hours from membership
 */
export const deductMembershipHoursInternal = (customer: Customer, hours: number): Customer => {
  if (!customer.isMember || customer.membershipHoursLeft === undefined) {
    return customer;
  }
  
  const updatedHoursLeft = Math.max(0, customer.membershipHoursLeft - hours);
  
  return {
    ...customer,
    membershipHoursLeft: updatedHoursLeft
  };
};

/**
 * Update customer membership data
 */
export const updateCustomerMembershipInternal = (
  customers: Customer[],
  customerId: string,
  membershipData: {
    membershipPlan?: string;
    membershipDuration?: 'weekly' | 'monthly';
    membershipHoursLeft?: number;
  }
): Customer | null => {
  const customerIndex = customers.findIndex(c => c.id === customerId);
  if (customerIndex === -1) return null;
  
  const customer = customers[customerIndex];
  
  // Calculate new expiry date based on duration if provided
  let membershipExpiryDate = customer.membershipExpiryDate;
  
  if (membershipData.membershipDuration) {
    const now = new Date();
    const startDate = now;
    
    if (membershipData.membershipDuration === 'weekly') {
      // Set expiry to 7 days from now
      membershipExpiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (membershipData.membershipDuration === 'monthly') {
      // Set expiry to 30 days from now
      membershipExpiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }
  
  return {
    ...customer,
    isMember: true,
    membershipStartDate: customer.membershipStartDate || new Date(),
    membershipExpiryDate,
    membershipPlan: membershipData.membershipPlan || customer.membershipPlan,
    membershipDuration: membershipData.membershipDuration || customer.membershipDuration,
    membershipHoursLeft: 
      membershipData.membershipHoursLeft !== undefined 
        ? membershipData.membershipHoursLeft 
        : customer.membershipHoursLeft
  };
};
