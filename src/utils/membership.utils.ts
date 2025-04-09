
import { Customer } from '@/types/pos.types';

/**
 * Check if customer has an active membership
 */
export const isMembershipActive = (customer: Customer): boolean => {
  if (!customer.isMember) return false;
  
  // Check expiry date
  if (customer.membershipExpiryDate) {
    const expiryDate = new Date(customer.membershipExpiryDate);
    if (expiryDate < new Date()) return false;
  }
  
  // Check if hours are depleted
  if (customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft <= 0) {
    return false;
  }
  
  return true;
};

/**
 * Get text for the membership badge
 */
export const getMembershipBadgeText = (customer: Customer): string => {
  if (!customer.isMember) return 'Non-Member';
  
  if (!isMembershipActive(customer)) {
    if (customer.membershipExpiryDate && new Date(customer.membershipExpiryDate) < new Date()) {
      return 'Expired';
    }
    if (customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft <= 0) {
      return 'Hours Used';
    }
    return 'Inactive';
  }
  
  if (customer.membershipDuration === 'weekly') {
    return 'Weekly';
  } else if (customer.membershipDuration === 'monthly') {
    return 'Monthly';
  } else if (customer.membershipPlan) {
    return customer.membershipPlan;
  } else {
    return 'Member';
  }
};

/**
 * Format hours as a duration string (hh:mm:ss)
 */
export const formatHoursAsDuration = (hours: number): string => {
  if (hours === undefined || hours === null) return "00:00:00";
  
  // Ensure we don't have negative hours
  const positiveHours = Math.max(0, hours);
  
  const totalSeconds = Math.floor(positiveHours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Convert a duration in minutes to hours (decimal)
 */
export const minutesToHours = (minutes: number): number => {
  return minutes / 60;
};

/**
 * Convert seconds to hours (decimal)
 */
export const secondsToHours = (seconds: number): number => {
  return seconds / 3600;
};

/**
 * Calculate how many hours to deduct based on elapsed time
 * For real-time tracking, we use precise seconds
 */
export const calculateHoursToDeduct = (elapsedSeconds: number): number => {
  return secondsToHours(elapsedSeconds);
};

/**
 * Get color class for hours left display
 */
export const getHoursLeftColor = (hoursLeft: number): string => {
  if (hoursLeft <= 0) {
    return 'text-red-500 font-bold';
  } else if (hoursLeft <= 2) {
    return 'text-amber-500 font-bold';
  } else if (hoursLeft <= 5) {
    return 'text-amber-400';
  } else {
    return 'text-green-500';
  }
};
