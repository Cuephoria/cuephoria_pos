
/**
 * Utility functions for time-related operations
 */

/**
 * Calculate the duration between two dates in minutes
 * @param startTime - The start time
 * @param endTime - The end time
 * @returns The duration in minutes
 */
export const calculateSessionDuration = (startTime: Date, endTime: Date): number => {
  const diffMs = endTime.getTime() - startTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return diffMinutes;
};
