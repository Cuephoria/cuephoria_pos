
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Cache for today's bookings to avoid redundant API calls
let bookingsCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

export const useTodayBookings = () => {
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [groupedBookings, setGroupedBookings] = useState<Record<string, any[]>>({});
  const [bookingTimeSlots, setBookingTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to group bookings by time slot
  const groupBookingsByTime = useCallback((bookings: any[]) => {
    const grouped: Record<string, any[]> = {};
    
    bookings.forEach(booking => {
      const timeKey = booking.start_time.substring(0, 5);
      if (!grouped[timeKey]) {
        grouped[timeKey] = [];
      }
      grouped[timeKey].push(booking);
    });
    
    return grouped;
  }, []);

  // Function to fetch today's bookings with caching
  const fetchTodayBookings = useCallback(async () => {
    setLoading(true);
    
    try {
      // Use cached data if available and not expired
      if (bookingsCache && (Date.now() - lastFetchTime < CACHE_DURATION)) {
        console.log('Using cached bookings data');
        setTodayBookings(bookingsCache);
        const grouped = groupBookingsByTime(bookingsCache);
        setGroupedBookings(grouped);
        setBookingTimeSlots(Object.keys(grouped).sort());
        setLoading(false);
        return;
      }
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          end_time,
          duration,
          status,
          stations (id, name, type),
          customers (id, name, phone)
        `)
        .eq('booking_date', today)
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      
      // Update cache
      bookingsCache = data || [];
      lastFetchTime = Date.now();
      
      setTodayBookings(bookingsCache);
      const grouped = groupBookingsByTime(bookingsCache);
      setGroupedBookings(grouped);
      setBookingTimeSlots(Object.keys(grouped).sort());
      
    } catch (error) {
      console.error('Error fetching today\'s bookings:', error);
      toast.error('Failed to load today\'s bookings');
    } finally {
      setLoading(false);
    }
  }, [groupBookingsByTime]);
  
  // Set up notification for upcoming bookings
  useEffect(() => {
    // Function to check for upcoming bookings
    const checkUpcomingBookings = () => {
      try {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
        
        if (todayBookings && todayBookings.length > 0) {
          todayBookings.forEach(booking => {
            const [hours, minutes] = booking.start_time.split(':').map(Number);
            const bookingTimeInMinutes = hours * 60 + minutes;
            
            // Check if booking is 15 minutes away
            const timeUntilBooking = bookingTimeInMinutes - currentTime;
            if (timeUntilBooking > 0 && timeUntilBooking <= 15) {
              const customerName = booking.customers?.name || 'Customer';
              const stationName = booking.stations?.name || 'a station';
              
              toast.info(
                `Upcoming booking for ${customerName} at ${booking.start_time} for ${stationName}`,
                {
                  duration: 10000, // Show for 10 seconds
                  id: `booking-reminder-${booking.id}` // Prevent duplicate notifications
                }
              );
            }
          });
        }
      } catch (error) {
        console.error('Error checking upcoming bookings:', error);
      }
    };
    
    // Initial fetch
    fetchTodayBookings();
    
    // Check when component mounts and then every minute
    checkUpcomingBookings();
    const intervalId = setInterval(checkUpcomingBookings, 60 * 1000);
    
    // Set up a refresh interval for the bookings data (every 2 minutes)
    const refreshIntervalId = setInterval(fetchTodayBookings, 2 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(refreshIntervalId);
    };
  }, [todayBookings, fetchTodayBookings]);

  return {
    todayBookings,
    groupedBookings,
    bookingTimeSlots,
    loading,
    fetchTodayBookings
  };
};
