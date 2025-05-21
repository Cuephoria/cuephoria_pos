
import { useState, useCallback, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isDateInPast, generateTimeSlots } from '@/utils/booking';
import { TimeSlot } from '@/context/BookingContext';

// Cache for time slots to avoid redundant API calls
const timeSlotsCache = new Map<string, { data: TimeSlot[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

interface UseTimeSlotsProps {
  date: Date;
  duration: number;
}

export const useTimeSlots = ({ date, duration }: UseTimeSlotsProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isToday, setIsToday] = useState<boolean>(true);
  
  // Function to generate cache key based on date and duration
  const generateCacheKey = useCallback((date: Date, duration: number) => {
    return `${format(date, 'yyyy-MM-dd')}_${duration}`;
  }, []);

  // Fetch available time slots with caching
  const fetchTimeSlots = useCallback(async () => {
    if (!date) return;
    
    setLoading(true);
    const cacheKey = generateCacheKey(date, duration);
    const cachedData = timeSlotsCache.get(cacheKey);
    
    // Use cached data if available and not expired
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
      console.log('Using cached time slots data');
      setTimeSlots(cachedData.data);
      setLoading(false);
      return;
    }
    
    try {
      // Check if selected date is today
      const now = new Date();
      const isDateToday = isSameDay(date, now);
      setIsToday(isDateToday);
      
      // Generate base time slots for the day (11am - 11pm)
      // If today, pass the current time to filter out past time slots
      const baseSlots = generateTimeSlots(
        '11:00', 
        '23:00', 
        duration, 
        isDateToday ? now : undefined
      );
      
      // Format date for API call (YYYY-MM-DD)
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Fetch bookings for this date to determine which slots are unavailable
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('start_time, end_time, station_id')
        .eq('booking_date', formattedDate)
        .eq('status', 'confirmed');
      
      if (bookingsError) {
        console.error("Error fetching existing bookings:", bookingsError);
        setTimeSlots(baseSlots); // On error, show all slots
        return;
      }
      
      // Get all stations to check booking counts against total stations
      const { data: stationsData } = await supabase
        .from('stations')
        .select('id');
        
      const totalStations = stationsData?.length || 0;
      
      // If no bookings found, all slots are available
      if (!existingBookings || existingBookings.length === 0) {
        // Store in cache
        timeSlotsCache.set(cacheKey, { 
          data: baseSlots,
          timestamp: Date.now()
        });
        
        setTimeSlots(baseSlots);
        setLoading(false);
        return;
      }
      
      // Map to count bookings per time slot
      const slotBookingMap = new Map();
      
      // Initialize the map with all slots and 0 bookings
      baseSlots.forEach(slot => {
        slotBookingMap.set(`${slot.startTime}-${slot.endTime}`, 0);
      });
      
      // Group bookings by time slot and count them
      existingBookings.forEach(booking => {
        const bookingStart = booking.start_time;
        const bookingEnd = booking.end_time;
        
        // Check each base slot to see if it overlaps with this booking
        baseSlots.forEach(slot => {
          const slotStart = slot.startTime + ":00";
          const slotEnd = slot.endTime + ":00";
          
          // Check if this booking overlaps with the current slot
          if (
            (bookingStart <= slotStart && bookingEnd > slotStart) || // Booking starts before and ends during/after slot
            (bookingStart < slotEnd && bookingEnd >= slotEnd) || // Booking starts during and ends after slot
            (bookingStart >= slotStart && bookingEnd <= slotEnd) // Booking is contained within slot
          ) {
            // Increment booking count for this slot
            const key = `${slot.startTime}-${slot.endTime}`;
            const currentCount = slotBookingMap.get(key) || 0;
            slotBookingMap.set(key, currentCount + 1);
          }
        });
      });
      
      // Determine availability based on booking counts
      // A slot is unavailable only if ALL stations are booked for that slot
      const availableSlots = baseSlots.map(slot => {
        const key = `${slot.startTime}-${slot.endTime}`;
        const bookingCount = slotBookingMap.get(key) || 0;
        
        return {
          ...slot,
          isAvailable: bookingCount < totalStations
        };
      });
      
      // Sort slots by start time
      availableSlots.sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
      
      // Store in cache
      timeSlotsCache.set(cacheKey, { 
        data: availableSlots,
        timestamp: Date.now()
      });
      
      setTimeSlots(availableSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      
      // Generate fallback time slots if API call fails
      const now = new Date();
      const isDateToday = isSameDay(date, now);
      const fallbackSlots = generateTimeSlots('11:00', '23:00', duration, isDateToday ? now : undefined);
      setTimeSlots(fallbackSlots);
      toast.error('Could not verify slot availability. All slots shown as available.');
    } finally {
      setLoading(false);
    }
  }, [date, duration, generateCacheKey]);

  // Fetch time slots whenever date or duration changes
  useEffect(() => {
    if (date) {
      fetchTimeSlots();
    }
  }, [date, duration, fetchTimeSlots]);

  return {
    timeSlots,
    loading,
    isToday,
    refreshTimeSlots: fetchTimeSlots
  };
};
