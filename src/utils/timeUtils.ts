
/**
 * Calculate duration between two dates in minutes
 * @param startTime Start time of the session
 * @param endTime End time of the session
 * @returns Duration in minutes
 */
export const calculateSessionDuration = (startTime: Date, endTime: Date): number => {
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  return durationMinutes;
};

/**
 * Format minutes as hours and minutes
 * @param minutes Total minutes
 * @returns Formatted string (e.g., "2h 30m")
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Get time elapsed since a given date
 * @param date The start date
 * @returns Time elapsed in minutes
 */
export const getTimeElapsedSince = (date: Date): number => {
  const now = new Date();
  return calculateSessionDuration(date, now);
};

/**
 * Format a date as a time string (HH:MM)
 * @param date The date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
