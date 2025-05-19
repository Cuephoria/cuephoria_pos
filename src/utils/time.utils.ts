
import { formatDistanceToNow, differenceInMinutes, differenceInHours } from 'date-fns';

/**
 * Format duration from a start time to now
 * @param startTime ISO string or Date object
 * @returns Formatted duration string
 */
export const formatDuration = (startTime: string | Date): string => {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const now = new Date();
  
  const minutes = differenceInMinutes(now, start) % 60;
  const hours = differenceInHours(now, start);
  
  return `${hours}h ${minutes}m`;
};

/**
 * Get formatted time elapsed since a given date
 * @param date ISO string or Date object
 * @returns Formatted relative time
 */
export const getTimeElapsed = (date: string | Date): string => {
  return formatDistanceToNow(
    typeof date === 'string' ? new Date(date) : date, 
    { addSuffix: true }
  );
};
