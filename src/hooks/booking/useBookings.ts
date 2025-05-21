
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isBefore, isToday } from 'date-fns';

// Optimized hook for bookings management
export const useBookings = () => {
  const queryClient = useQueryClient();
  
  // Optimized bookings fetch with query caching
  const { 
    data: bookings, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      console.time('fetchBookings');
      
      // Fetch bookings with relevant joins in a single query
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          station:station_id (id, name, type),
          customer:customer_id (id, name, phone, email)
        `)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      console.timeEnd('fetchBookings');
      return data;
    },
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for performance
    refetchOnMount: true,
    placeholderData: (previousData) => previousData, // Use previous data while refetching
  });

  // Delete booking with optimistic update for instant UI feedback
  const deleteBooking = async (bookingId: string) => {
    try {
      // Save current state for rollback if needed
      const previousBookings = queryClient.getQueryData(['bookings']);
      
      // Optimistically update UI immediately by removing the booking from cache
      queryClient.setQueryData(['bookings'], (old: any[] | undefined) => 
        old ? old.filter(booking => booking.id !== bookingId) : []
      );
      
      // Perform the actual deletion operations asynchronously
      
      // First, delete associated booking_views
      const { error: viewsError } = await supabase
        .from('booking_views')
        .delete()
        .eq('booking_id', bookingId);
      
      if (viewsError) {
        // Rollback on error
        queryClient.setQueryData(['bookings'], previousBookings);
        console.error('Error deleting booking views:', viewsError);
        toast.error('Failed to delete booking: ' + viewsError.message);
        return false;
      }
      
      // After successfully deleting booking_views, delete the booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
      
      if (error) {
        // Rollback on error
        queryClient.setQueryData(['bookings'], previousBookings);
        throw error;
      }
      
      toast.success('Booking deleted successfully');
      
      // Finally invalidate query to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  };
  
  // Delete all bookings with optimistic update for instant UI feedback
  const deleteAllBookings = async () => {
    try {
      // Save current state for rollback if needed
      const previousBookings = queryClient.getQueryData(['bookings']);
      
      // Optimistically update UI immediately by clearing the bookings cache
      queryClient.setQueryData(['bookings'], []);
      
      // Perform the actual deletion operations asynchronously
      
      // First, delete all booking_views
      const { error: viewsError } = await supabase
        .from('booking_views')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (viewsError) {
        // Rollback on error
        queryClient.setQueryData(['bookings'], previousBookings);
        console.error('Error deleting booking views:', viewsError);
        toast.error('Failed to delete all bookings: ' + viewsError.message);
        return false;
      }
      
      // After successfully deleting booking_views, delete all bookings
      const { error } = await supabase
        .from('bookings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        // Rollback on error
        queryClient.setQueryData(['bookings'], previousBookings);
        throw error;
      }
      
      toast.success('All bookings deleted successfully');
      
      // Finally invalidate query to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      return true;
    } catch (error) {
      console.error('Error deleting all bookings:', error);
      throw error;
    }
  };
  
  // Update booking with optimistic updates
  const updateBooking = async (bookingId: string, updateData: any) => {
    try {
      // Save current state for rollback if needed
      const previousBookings = queryClient.getQueryData(['bookings']);
      
      // Optimistically update UI immediately
      queryClient.setQueryData(['bookings'], (old: any[] | undefined) => 
        old ? old.map(booking => 
          booking.id === bookingId ? { ...booking, ...updateData } : booking
        ) : []
      );
      
      // Perform the actual update operation
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);
      
      if (error) {
        // Rollback on error
        queryClient.setQueryData(['bookings'], previousBookings);
        throw error;
      }
      
      // Finally invalidate query to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  // Calculate statistics with memoization for performance
  const stats = useMemo(() => {
    console.time('calculateStats');
    
    if (!bookings) return { total: 0, upcoming: 0, today: 0, ps5: 0, pool: 0 };
    
    const result = {
      total: bookings.length,
      upcoming: 0,
      today: 0,
      ps5: 0,
      pool: 0
    };
    
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const todayStr = format(now, 'yyyy-MM-dd');
    
    // Use a more efficient loop
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const bookingDate = booking.booking_date;
      
      // Check if it's an upcoming booking
      const isUpcoming = bookingDate > todayStr || 
                        (bookingDate === todayStr && booking.start_time > currentTime);
      
      if (isUpcoming && booking.status === 'confirmed') {
        result.upcoming++;
      }
      
      // Check if it's today's booking
      if (bookingDate === todayStr) {
        result.today++;
      }
      
      // Count by station type
      if (booking.station?.type === 'ps5') {
        result.ps5++;
      } else if (booking.station?.type === '8ball') {
        result.pool++;
      }
    }
    
    console.timeEnd('calculateStats');
    return result;
  }, [bookings]);

  return {
    bookings,
    isLoading,
    error,
    refetch,
    stats,
    deleteBooking,
    deleteAllBookings,
    updateBooking
  };
};
