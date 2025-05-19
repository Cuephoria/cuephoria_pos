
import { differenceInMinutes } from 'date-fns';

/**
 * Format duration between a start time and now in hours and minutes
 * @param startTime The start time of a session
 * @returns Formatted duration string (e.g. "2h 30m")
 */
export const formatDuration = (startTime: Date | string): string => {
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const now = new Date();
  
  const durationInMinutes = differenceInMinutes(now, start);
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};
