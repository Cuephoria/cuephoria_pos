
/**
 * Helper functions for the booking system
 */

/**
 * Generate time slots in the specified range
 * @param startTimeStr Opening time (format: "HH:MM")
 * @param endTimeStr Closing time (format: "HH:MM")
 * @param slotDuration Duration of each slot in minutes
 * @param currentTime Optional current time to filter past slots
 * @returns Array of time slots
 */
export const generateTimeSlots = (
  startTimeStr: string,
  endTimeStr: string,
  slotDuration: number,
  currentTime?: Date
): { startTime: string; endTime: string; isAvailable: boolean }[] => {
  // Parse start and end times
  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);
  
  // Convert to minutes for easier calculation
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Calculate the current time in minutes if provided
  const now = currentTime || new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const nowInMinutes = currentHour * 60 + currentMinute;
  
  // Add buffer time (30 minutes) to current time
  const bufferTimeInMinutes = 30;
  const earliestBookingTime = nowInMinutes + bufferTimeInMinutes;
  
  const slots = [];
  
  // Generate slots until we reach end time
  while (currentMinutes + slotDuration <= endMinutes) {
    // Calculate end time for this slot
    const endSlotMinutes = currentMinutes + slotDuration;
    
    // Format times as HH:MM
    const startTime = formatTime(currentMinutes);
    const endTime = formatTime(endSlotMinutes);
    
    // Check if this time slot is in the past
    const isInPast = currentMinutes < earliestBookingTime;
    
    // Add the slot (filter out past time slots)
    if (!isInPast) {
      slots.push({
        startTime,
        endTime,
        isAvailable: true // Default to available, will be checked against DB later
      });
    }
    
    // Move to next slot
    currentMinutes = endSlotMinutes;
  }
  
  return slots;
};

/**
 * Format minutes as HH:MM
 */
const formatTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Map database slot response to frontend format
 * @param dbSlot The slot object from database
 * @returns Properly formatted slot for frontend
 */
export const mapDatabaseSlotToFrontend = (dbSlot: any) => {
  return {
    startTime: dbSlot.start_time.substring(0, 5), // Get HH:MM from HH:MM:SS
    endTime: dbSlot.end_time.substring(0, 5),    // Get HH:MM from HH:MM:SS
    isAvailable: dbSlot.is_available
  };
};

/**
 * Get the earliest available booking time with buffer
 * @param bufferMinutes Number of minutes to add as buffer (default: 30)
 * @returns Formatted string with earliest booking time
 */
export const getEarliestBookingTime = (bufferMinutes = 30): string => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Add buffer
  let bookingMinute = currentMinute + bufferMinutes;
  let bookingHour = currentHour;
  
  // Handle minute overflow
  if (bookingMinute >= 60) {
    bookingHour += Math.floor(bookingMinute / 60);
    bookingMinute = bookingMinute % 60;
  }
  
  // Format as HH:MM
  return `${bookingHour.toString().padStart(2, '0')}:${bookingMinute.toString().padStart(2, '0')}`;
};
