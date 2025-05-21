
/**
 * Helper functions for the booking system
 */

/**
 * Generate time slots in the specified range
 * @param startTimeStr Opening time (format: "HH:MM")
 * @param endTimeStr Closing time (format: "HH:MM")
 * @param slotDuration Duration of each slot in minutes
 * @returns Array of time slots
 */
export const generateTimeSlots = (
  startTimeStr: string,
  endTimeStr: string,
  slotDuration: number
): { startTime: string; endTime: string; isAvailable: boolean }[] => {
  // Parse start and end times
  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);
  
  // Convert to minutes for easier calculation
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  const slots = [];
  
  // Generate slots until we reach end time
  while (currentMinutes + slotDuration <= endMinutes) {
    // Calculate end time for this slot
    const endSlotMinutes = currentMinutes + slotDuration;
    
    // Format times as HH:MM
    const startTime = formatTime(currentMinutes);
    const endTime = formatTime(endSlotMinutes);
    
    // Add the slot
    slots.push({
      startTime,
      endTime,
      isAvailable: true // Default to available
    });
    
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
