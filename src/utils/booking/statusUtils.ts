
/**
 * Booking status utilities
 */

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
