
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
 * Formats seconds into a duration string (hh:mm:ss)
 */
export const formatDurationFromSeconds = (seconds: number | undefined): string => {
  if (seconds === undefined) return '00:00:00';
  
  // Ensure seconds is non-negative
  seconds = Math.max(0, seconds);
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Converts a duration string (hh:mm:ss) to seconds
 */
export const durationToSeconds = (duration: string): number => {
  if (!duration) return 0;
  
  const parts = duration.split(':');
  if (parts.length !== 3) return 0;
  
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Converts hours (as a number) to seconds
 */
export const hoursToSeconds = (hours: number | undefined): number => {
  if (hours === undefined) return 0;
  return Math.round(hours * 3600);
};

/**
 * Converts seconds to hours (decimal form)
 */
export const secondsToHours = (seconds: number | undefined): number => {
  if (seconds === undefined) return 0;
  return parseFloat((seconds / 3600).toFixed(2));
};

/**
 * Gets the appropriate color class for hours left indicator
 */
export const getHoursLeftColor = (secondsLeft: number | undefined): string => {
  if (secondsLeft === undefined) return '';
  
  // Convert to hours for threshold comparison
  const hoursLeft = secondsToHours(secondsLeft);
  
  if (hoursLeft <= 0) return 'text-red-600';
  if (hoursLeft < 2) return 'text-orange-500';
  return 'text-green-600';
};
