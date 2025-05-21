
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseStationBookingProps {
  onBookingConfirmed?: (bookingIds: string[], bookingGroupId: string, accessCode: string) => void;
  onBookingError?: (error: string) => void;
}

export const useStationBooking = ({ 
  onBookingConfirmed,
  onBookingError
}: UseStationBookingProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [bookingAccessCode, setBookingAccessCode] = useState<string>('');
  const [bookingGroupId, setBookingGroupId] = useState<string | null>(null);

  // Submit booking with optimized error handling
  const submitBooking = useCallback(async ({
    selectedStations,
    selectedDate,
    selectedTimeSlot,
    bookingDuration,
    customerInfo,
    couponCode,
    discountPercentage
  }: any) => {
    if (selectedStations.length === 0 || !selectedDate || !selectedTimeSlot || !customerInfo.name || !customerInfo.phone) {
      const error = 'Missing required booking information';
      setBookingError(error);
      onBookingError?.(error);
      return false;
    }
    
    setIsSubmitting(true);
    setBookingError(null);
    setBookingIds([]);
    setBookingAccessCode('');
    
    try {
      // Check if customer exists by phone number
      let customerId = customerInfo.customerId;
      
      if (!customerId) {
        // Look up customer by phone
        const { data: existingCustomers, error: customerLookupError } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', customerInfo.phone)
          .limit(1);
        
        if (customerLookupError) {
          throw new Error('Error looking up customer: ' + customerLookupError.message);
        }
          
        // If customer exists, use their ID
        if (existingCustomers && existingCustomers.length > 0) {
          customerId = existingCustomers[0].id;
        } else {
          // Create new customer
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({
              name: customerInfo.name,
              phone: customerInfo.phone,
              email: customerInfo.email || null,
              is_member: false,
              loyalty_points: 0,
              total_spent: 0,
              total_play_time: 0
            })
            .select('id')
            .single();
            
          if (customerError) {
            throw new Error('Failed to create customer: ' + customerError.message);
          }
          
          if (!newCustomer) {
            throw new Error('Failed to create customer: No customer ID returned');
          }
          
          customerId = newCustomer.id;
        }
      }
      
      if (!customerId) {
        throw new Error('Failed to get customer ID');
      }
      
      // Create a booking group ID for all stations (even if only one)
      const groupId = crypto.randomUUID();
      setBookingGroupId(groupId);
      
      // Calculate the final price with any applicable discounts
      const discount = discountPercentage > 0 ? discountPercentage : 0;
      
      // Create bookings for each selected station
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Perform one final availability check before booking
      const startTimeFormatted = selectedTimeSlot.startTime + ':00';
      const endTimeFormatted = selectedTimeSlot.endTime + ':00';
      
      // Create bookings for each selected station
      const bookings = selectedStations.map(station => ({
        customer_id: customerId,
        station_id: station.id,
        booking_date: formattedDate,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
        duration: bookingDuration,
        status: 'confirmed',
        booking_group_id: groupId,
        coupon_code: couponCode || null,
        discount_percentage: discount,
        original_price: station.hourlyRate * (bookingDuration / 60),
        final_price: (station.hourlyRate * (bookingDuration / 60)) * (1 - (discount/100))
      }));
      
      // Insert all bookings in one request to improve performance
      const { data: newBookings, error: bookingsError } = await supabase
        .from('bookings')
        .insert(bookings)
        .select('id');
        
      if (bookingsError) {
        throw new Error('Failed to create bookings: ' + bookingsError.message);
      }
      
      if (!Array.isArray(newBookings) || newBookings.length === 0) {
        throw new Error('No bookings were created');
      }
      
      // Extract the booking IDs
      const createdBookingIds = newBookings.map(b => b.id);
      setBookingIds(createdBookingIds);
      
      // Get access code for the first booking
      if (createdBookingIds.length > 0) {
        const { data: accessCodeData, error: accessCodeError } = await supabase
          .from('booking_views')
          .select('access_code')
          .eq('booking_id', createdBookingIds[0])
          .maybeSingle();
          
        if (!accessCodeError && accessCodeData) {
          setBookingAccessCode(accessCodeData.access_code);
        } else {
          // Generate a fallback access code
          setBookingAccessCode(createdBookingIds[0].substring(0, 8));
        }
      }
      
      if (onBookingConfirmed) {
        onBookingConfirmed(createdBookingIds, groupId, bookingAccessCode);
      }
      
      return true;
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage = error.message || 'Failed to create booking';
      setBookingError(errorMessage);
      if (onBookingError) {
        onBookingError(errorMessage);
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [onBookingConfirmed, onBookingError]);

  return {
    submitBooking,
    isSubmitting,
    bookingError,
    bookingIds,
    bookingAccessCode,
    bookingGroupId
  };
};
