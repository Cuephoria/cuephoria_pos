
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

/**
 * Format minutes as HH:MM
 */
export const formatTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Format time display as HH:MM:SS
 * @param hours Hours component
 * @param minutes Minutes component
 * @param seconds Seconds component
 * @returns Formatted time string (HH:MM:SS)
 */
export const formatTimeDisplay = (hours: number, minutes: number, seconds: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate elapsed time components from a start time
 * @param startTime Start time as Date object
 * @returns Object containing hours, minutes, seconds, and total seconds elapsed
 */
export const calculateElapsedTime = (startTime: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  elapsedMs: number;
} => {
  const now = new Date();
  const elapsedMs = now.getTime() - startTime.getTime();
  
  if (elapsedMs < 0) {
    console.error("Negative elapsed time calculated", { 
      startTime: startTime.toISOString(), 
      now: now.toISOString() 
    });
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, elapsedMs: 0 };
  }
  
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { hours, minutes, seconds, totalSeconds, elapsedMs };
};

/**
 * Calculate session cost based on hourly rate, elapsed time, and member status
 * @param hourlyRate The hourly rate for the session
 * @param elapsedMs Elapsed time in milliseconds
 * @param isMember Whether the customer is a member (for discount)
 * @returns Calculated cost
 */
export const calculateSessionCost = (hourlyRate: number, elapsedMs: number, isMember: boolean): number => {
  // Calculate cost based on hourly rate
  const hoursElapsed = elapsedMs / (1000 * 60 * 60);
  let calculatedCost = Math.ceil(hoursElapsed * hourlyRate);
  
  // Apply 50% discount for members
  if (isMember) {
    calculatedCost = Math.ceil(calculatedCost * 0.5);
  }
  
  return calculatedCost;
};
