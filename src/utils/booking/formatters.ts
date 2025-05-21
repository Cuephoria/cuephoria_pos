
/**
 * Formatting utilities for booking data
 */

/**
 * Format date as YYYY-MM-DD
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
