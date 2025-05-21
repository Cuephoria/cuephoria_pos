
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
 * Check if two time ranges overlap
 * @param start1 Start time of first range (format: "HH:MM")
 * @param end1 End time of first range (format: "HH:MM")
 * @param start2 Start time of second range (format: "HH:MM")
 * @param end2 End time of second range (format: "HH:MM")
 * @returns Boolean indicating if the ranges overlap
 */
export const doTimeRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  // Add seconds for proper comparison
  const s1 = start1 + (start1.length === 5 ? ':00' : '');
  const e1 = end1 + (end1.length === 5 ? ':00' : '');
  const s2 = start2 + (start2.length === 5 ? ':00' : '');
  const e2 = end2 + (end2.length === 5 ? ':00' : '');

  // Check for overlap
  return (s1 <= s2 && e1 > s2) ||
         (s1 < e2 && e1 >= e2) ||
         (s1 >= s2 && e1 <= e2);
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

/**
 * Get booking status label with proper formatting
 * @param status The booking status string
 * @returns Object with color and label for the status
 */
export const getBookingStatusInfo = (status: string) => {
  const statusMap: Record<string, { color: string; label: string }> = {
    'confirmed': { color: 'bg-green-500/20 text-green-500 border-green-500/50', label: 'Confirmed' },
    'in-progress': { color: 'bg-blue-500/20 text-blue-500 border-blue-500/50', label: 'In Progress' },
    'completed': { color: 'bg-purple-500/20 text-purple-500 border-purple-500/50', label: 'Completed' },
    'cancelled': { color: 'bg-red-500/20 text-red-500 border-red-500/50', label: 'Cancelled' },
    'no-show': { color: 'bg-orange-500/20 text-orange-500 border-orange-500/50', label: 'No Show' }
  };

  return statusMap[status] || { color: 'bg-gray-500/20 text-gray-500 border-gray-500/50', label: status };
};

/**
 * Check and return if a booking is in the past based on date and end time
 * @param booking The booking object with date and end time
 * @returns Boolean indicating if booking is in the past
 */
export const isBookingInPast = (booking: { booking_date: string; end_time: string }) => {
  const today = new Date();
  const bookingDate = new Date(booking.booking_date);
  
  // Different dates - check if booking date is in the past
  if (bookingDate.toDateString() !== today.toDateString()) {
    return bookingDate < today;
  }
  
  // Same date - check if end time has passed
  const [endHours, endMinutes] = booking.end_time.split(':').map(Number);
  const endTimeInMinutes = (endHours * 60) + endMinutes;
  
  const currentHours = today.getHours();
  const currentMinutes = today.getMinutes();
  const currentTimeInMinutes = (currentHours * 60) + currentMinutes;
  
  return currentTimeInMinutes > endTimeInMinutes;
};
