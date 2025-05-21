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
    const isInPast = currentTime && isSameDay(currentTime, new Date()) && 
                     currentMinutes < earliestBookingTime;
    
    // Add the slot (filter out past time slots if it's today)
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
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
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

/**
 * Check if a date is in the past (before today)
 * @param date The date to check
 * @returns Boolean indicating if the date is before today
 */
export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
};

/**
 * Check if stations are available for a specific time slot
 * @param stationIds Array of station IDs to check
 * @param date Booking date in YYYY-MM-DD format
 * @param startTime Start time in HH:MM format
 * @param endTime End time in HH:MM format
 * @returns Promise resolving to object with availability info and unavailable station IDs
 */
export const checkStationAvailability = async (
  stationIds: string[],
  date: string,
  startTime: string,
  endTime: string
): Promise<{ available: boolean, unavailableStationIds: string[], unavailableStations?: Array<{id: string, name: string}> }> => {
  try {
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Ensure we have proper time formats with seconds for consistency
    const startTimeWithSeconds = startTime.includes(':00') ? startTime : `${startTime}:00`;
    const endTimeWithSeconds = endTime.includes(':00') ? endTime : `${endTime}:00`;
    
    console.log(`Checking availability for date=${date}, start=${startTimeWithSeconds}, end=${endTimeWithSeconds}`);
    console.log(`Station IDs to check:`, stationIds);
    
    // If no stations to check, return all available
    if (!stationIds || stationIds.length === 0) {
      return { available: true, unavailableStationIds: [] };
    }
    
    // Using manual check directly as it's more reliable
    // This approach queries the bookings table to find overlapping bookings
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('station_id, station:stations(id, name)')
      .eq('booking_date', date)
      .in('status', ['confirmed', 'in-progress'])
      .in('station_id', stationIds)
      .or(`start_time.lte.${startTimeWithSeconds},end_time.gt.${startTimeWithSeconds}`)
      .or(`start_time.lt.${endTimeWithSeconds},end_time.gte.${endTimeWithSeconds}`)
      .or(`start_time.gte.${startTimeWithSeconds},end_time.lte.${endTimeWithSeconds}`)
      .or(`start_time.lte.${startTimeWithSeconds},end_time.gte.${endTimeWithSeconds}`);
    
    if (checkError) {
      console.error('Error checking station availability:', checkError);
      // In case of error, assume all stations are available to avoid blocking bookings
      return { available: true, unavailableStationIds: [] };
    }
    
    // If no bookings found, all stations are available
    if (!existingBookings || existingBookings.length === 0) {
      console.log('No overlapping bookings found, all stations are available');
      return { available: true, unavailableStationIds: [] };
    }
    
    // Get the IDs of stations that are already booked for this time slot
    const bookedStationIds = existingBookings.map(booking => booking.station_id);
    
    // Filter out unavailable stations
    const unavailableStationIds = stationIds.filter(id => bookedStationIds.includes(id));
    
    // Get full station information for unavailable stations
    const unavailableStations = existingBookings
      .filter(booking => stationIds.includes(booking.station_id))
      .map(booking => ({
        id: booking.station_id,
        name: booking.station?.name || 'Unknown station'
      }));
    
    console.log('Manual availability check - unavailable stations:', unavailableStations);
    console.log('Unavailable station IDs:', unavailableStationIds);
    
    return {
      available: unavailableStationIds.length === 0,
      unavailableStationIds,
      unavailableStations
    };
    
  } catch (error) {
    console.error('Error in checkStationAvailability:', error);
    // In case of error, assume all stations are available to avoid blocking bookings
    return { available: true, unavailableStationIds: [] };
  }
};

/**
 * Perform a final availability check right before booking
 * This is a safeguard against race conditions between selecting stations and confirming booking
 */
export const performFinalAvailabilityCheck = async (
  stationIds: string[],
  date: string,
  startTime: string,
  endTime: string
): Promise<{success: boolean, message?: string, unavailableStations?: Array<{id: string, name: string}>}> => {
  try {
    console.log('Performing final availability check before booking');
    const result = await checkStationAvailability(stationIds, date, startTime, endTime);
    
    if (!result.available) {
      const stationNames = result.unavailableStations?.map(s => s.name).join(', ') || 'Some stations';
      return {
        success: false,
        message: `${stationNames} ${result.unavailableStations?.length === 1 ? 'is' : 'are'} no longer available for the selected time. Please select a different time or station.`,
        unavailableStations: result.unavailableStations
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in performFinalAvailabilityCheck:', error);
    return { 
      success: false, 
      message: 'Could not verify station availability. Please try again.' 
    };
  }
};
