
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Station } from '@/types/pos.types';
import { CalendarIcon, ChevronRight, Clock } from 'lucide-react';
import BookingSteps from '@/components/booking/BookingSteps';
import AvailableStationsGrid from '@/components/booking/AvailableStationsGrid';
import TimeSlotGrid from '@/components/booking/TimeSlotGrid';
import CustomerInfoForm from '@/components/booking/CustomerInfoForm';
import BookingSummary from '@/components/booking/BookingSummary';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { generateTimeSlots, mapDatabaseSlotToFrontend, getEarliestBookingTime } from '@/utils/booking.utils';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import ControllerManagement from '@/components/booking/ControllerManagement';

// Types for our booking form
interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  isExistingCustomer: boolean;
  customerId?: string;
}

interface TimeSlot {
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  isAvailable: boolean;
}

const BookNow = () => {
  // Current booking step (reordered flow)
  const [currentStep, setCurrentStep] = useState<1|2|3|4|5>(1);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingDuration, setBookingDuration] = useState<number>(60); // in minutes
  
  // Station selection
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStations, setSelectedStations] = useState<Station[]>([]);
  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState<boolean>(true);
  
  // Controller management
  const [totalControllers, setTotalControllers] = useState<number>(6);
  const [availableControllers, setAvailableControllers] = useState<number>(6);
  
  // Time slot selection
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState<boolean>(false);
  
  // Customer information
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    isExistingCustomer: false
  });
  
  // Coupon code
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  
  // Today's bookings
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [loadingTodayBookings, setLoadingTodayBookings] = useState<boolean>(false);
  
  // Booking summary
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [bookingAccessCode, setBookingAccessCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingGroupId, setBookingGroupId] = useState<string | null>(null);
  const [isToday, setIsToday] = useState<boolean>(true);

  // Fetch stations on component mount
  useEffect(() => {
    document.title = "Book Now | Cuephoria";
    fetchStations();
    fetchTodayBookings();
  }, []);
  
  // Check if selected date is today
  useEffect(() => {
    setIsToday(isSameDay(selectedDate, new Date()));
    // Reset time slot when date changes
    setSelectedTimeSlot(null);
    // Fetch time slots for the new date
    fetchAvailableTimeSlots();
  }, [selectedDate, bookingDuration]);
  
  // Update available stations when time slot changes
  useEffect(() => {
    if (selectedTimeSlot) {
      fetchAvailableStationsForTimeSlot();
    } else {
      setAvailableStations([]);
    }
  }, [selectedTimeSlot]);

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
    
    // Check when component mounts and then every minute
    checkUpcomingBookings();
    const intervalId = setInterval(checkUpcomingBookings, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [todayBookings]);

  // Update controller availability
  const updateControllerAvailability = async () => {
    try {
      if (!selectedDate || !selectedTimeSlot) {
        // Default to all controllers available if no date/time selected
        setAvailableControllers(6);
        return;
      }
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Count PS5 bookings for the selected time slot
      const { data: ps5Bookings, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', formattedDate)
        .eq('status', 'confirmed')
        .eq('start_time', selectedTimeSlot.startTime + ':00')
        .or(`end_time.gte.${selectedTimeSlot.endTime + ':00'}`)
        .in('station_id', stations
          .filter(s => s.type === 'ps5')
          .map(s => s.id)
        );
        
      if (error) throw error;
      
      // Calculate available controllers (total - booked)
      const bookedControllers = ps5Bookings?.length || 0;
      const remainingControllers = Math.max(0, totalControllers - bookedControllers);
      
      setAvailableControllers(remainingControllers);
      
    } catch (error) {
      console.error('Error checking controller availability:', error);
      // Default to showing all available if we can't check
      setAvailableControllers(6);
    }
  };

  // Function to fetch stations from database
  const fetchStations = async () => {
    setLoadingStations(true);
    
    try {
      // Fetch stations from Supabase
      const { data: stationsData, error } = await supabase
        .from('stations')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      // Transform data to match Station type
      const transformedStations: Station[] = stationsData?.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as 'ps5' | '8ball',
        hourlyRate: item.hourly_rate,
        isOccupied: item.is_occupied,
        currentSession: null
      })) || [];
      
      setStations(transformedStations);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setLoadingStations(false);
    }
  };

  // Function to fetch today's bookings
  const fetchTodayBookings = async () => {
    setLoadingTodayBookings(true);
    
    try {
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
      
      setTodayBookings(data || []);
    } catch (error) {
      console.error('Error fetching today\'s bookings:', error);
    } finally {
      setLoadingTodayBookings(false);
    }
  };

  // Function to fetch available time slots for the selected date
  const fetchAvailableTimeSlots = async () => {
    if (!selectedDate) return;
    
    setLoadingTimeSlots(true);
    
    try {
      // Format date for API call (YYYY-MM-DD)
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if selected date is today
      const now = new Date();
      const isToday = isSameDay(selectedDate, now);
      
      // First, generate time slots for the day (11am - 11pm)
      // If today, pass the current time to filter out past time slots
      const allSlots = generateTimeSlots('11:00', '23:00', bookingDuration, isToday ? now : undefined);
      
      // We'll check if there are any stations available at each time slot
      let availableTimeSlots = [...allSlots];
      
      // Get all stations to check availability
      availableTimeSlots = await checkOverallAvailability(formattedDate, availableTimeSlots);
      
      setTimeSlots(availableTimeSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      
      // Generate fallback time slots if API call fails
      const now = new Date();
      const isToday = isSameDay(selectedDate, now);
      const fallbackSlots = generateTimeSlots('11:00', '23:00', bookingDuration, isToday ? now : undefined).map(slot => ({
        ...slot,
        isAvailable: true // Make all slots available as fallback
      }));
      setTimeSlots(fallbackSlots);
      toast.error('Could not verify slot availability. All slots shown as available.');
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Function to check if any stations are available at each time slot
  const checkOverallAvailability = async (formattedDate: string, timeSlots: TimeSlot[]): Promise<TimeSlot[]> => {
    try {
      // Get all bookings for this date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('station_id, start_time, end_time')
        .eq('booking_date', formattedDate)
        .eq('status', 'confirmed');
      
      if (error) throw error;
      
      // Create a map to track which stations are booked at which times
      const bookedStations: Record<string, Set<string>> = {};
      
      // Format each time slot for lookup
      timeSlots.forEach(slot => {
        bookedStations[`${slot.startTime}-${slot.endTime}`] = new Set();
      });
      
      // Mark stations as booked for their respective time slots
      if (bookings) {
        bookings.forEach(booking => {
          const bookingStart = booking.start_time.substring(0, 5); // Get HH:MM from HH:MM:SS
          const bookingEnd = booking.end_time.substring(0, 5);
          
          // Check each time slot for overlap with this booking
          timeSlots.forEach(slot => {
            // Check if booking overlaps with this time slot
            const slotStart = slot.startTime;
            const slotEnd = slot.endTime;
            
            // Booking overlaps if:
            // 1. Booking starts before or at slot start AND booking ends after slot start
            // 2. Booking starts before slot end AND booking ends after or at slot end
            // 3. Booking starts after or at slot start AND booking ends before or at slot end
            if (
              (bookingStart <= slotStart && bookingEnd > slotStart) ||
              (bookingStart < slotEnd && bookingEnd >= slotEnd) ||
              (bookingStart >= slotStart && bookingEnd <= slotEnd)
            ) {
              // Add this station to the set of booked stations for this time slot
              bookedStations[`${slotStart}-${slotEnd}`].add(booking.station_id);
            }
          });
        });
      }
      
      // Now mark each time slot as available or not based on if there are stations available
      const totalStationCount = stations.length;
      
      return timeSlots.map(slot => {
        const key = `${slot.startTime}-${slot.endTime}`;
        const bookedCount = bookedStations[key]?.size || 0;
        
        // A slot is available if at least one station is available
        return {
          ...slot,
          isAvailable: bookedCount < totalStationCount
        };
      });
      
    } catch (error) {
      console.error('Error checking overall availability:', error);
      return timeSlots; // Return original slots if error
    }
  };

  // Function to fetch available stations for selected time slot
  const fetchAvailableStationsForTimeSlot = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      setAvailableStations([]);
      return;
    }
    
    setLoadingStations(true);
    setSelectedStations([]); // Clear selected stations when time slot changes
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Get all booked stations for the selected time slot
      const { data: bookedStations, error } = await supabase
        .from('bookings')
        .select('station_id')
        .eq('booking_date', formattedDate)
        .eq('status', 'confirmed')
        .or(
          `start_time.lte.${selectedTimeSlot.startTime + ':00'},end_time.gt.${selectedTimeSlot.startTime + ':00'}`,
          `start_time.lt.${selectedTimeSlot.endTime + ':00'},end_time.gte.${selectedTimeSlot.endTime + ':00'}`,
          `start_time.gte.${selectedTimeSlot.startTime + ':00'},end_time.lte.${selectedTimeSlot.endTime + ':00'}`
        );
        
      if (error) throw error;
      
      const bookedStationIds = new Set((bookedStations || []).map(b => b.station_id));
      
      // Filter available stations
      const available = stations.filter(station => !bookedStationIds.has(station.id));
      
      setAvailableStations(available);
      
      // Update controller availability
      updateControllerAvailability();
      
    } catch (error) {
      console.error('Error fetching available stations:', error);
      toast.error('Failed to check station availability');
      setAvailableStations(stations); // Show all stations as fallback
    } finally {
      setLoadingStations(false);
    }
  };
  
  // Handle station selection/deselection
  const handleStationSelect = (station: Station) => {
    setSelectedStations(prev => {
      const isAlreadySelected = prev.some(s => s.id === station.id);
      
      if (isAlreadySelected) {
        return prev.filter(s => s.id !== station.id);
      } else {
        // Check if we're selecting a PS5 station and if there are enough controllers
        if (station.type === 'ps5' && 
            prev.filter(s => s.type === 'ps5').length >= availableControllers) {
          toast.error(`Cannot select more PS5 stations. Only ${availableControllers} controllers available.`);
          return prev;
        }
        return [...prev, station];
      }
    });
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };

  // Handle date selection 
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      
      // Check if the selected date is today
      setIsToday(isSameDay(date, new Date()));
    }
  };
  
  // Handle duration change
  const handleDurationChange = (duration: string) => {
    const durationMinutes = parseInt(duration);
    setBookingDuration(durationMinutes);
    setSelectedTimeSlot(null); // Reset time slot when duration changes
  };

  // Handle customer information form changes
  const handleCustomerInfoChange = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  // Handle coupon code application
  const handleCouponApply = (code: string) => {
    // Prevent applying coupon multiple times
    if (couponCode === code) {
      toast.info('This coupon is already applied');
      return;
    }
    
    setCouponCode(code);
    
    // Simple validation for the coupon code
    if (code.toLowerCase() === 'cuephoria50') {
      setDiscountPercentage(50); // 50% discount
      toast.success('50% discount applied!');
    } else {
      setDiscountPercentage(0);
    }
  };
  
  // Calculate discounted price
  const calculateTotalPrice = () => {
    const originalPrice = selectedStations.reduce((sum, station) => 
      sum + (station.hourlyRate * (bookingDuration / 60)), 0
    );
    
    if (discountPercentage > 0) {
      return originalPrice * (1 - (discountPercentage/100));
    }
    
    return originalPrice;
  };
  
  // Handle share booking details
  const handleShareBooking = async () => {
    if (!bookingIds.length || !customerInfo.name) return;

    try {
      const bookingViewUrl = `${window.location.origin}/bookings/check?code=${bookingAccessCode}`;
      
      const bookingDetails = {
        customerName: customerInfo.name,
        stations: selectedStations.map(s => s.name).join(", "),
        date: format(selectedDate, 'EEEE, MMMM d, yyyy'),
        time: `${selectedTimeSlot?.startTime} - ${selectedTimeSlot?.endTime}`,
        duration: `${bookingDuration} minutes`,
        viewUrl: bookingViewUrl
      };

      // Use the Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Cuephoria Booking Confirmation',
            text: `My booking at Cuephoria for ${bookingDetails.stations} on ${bookingDetails.date} at ${bookingDetails.time}`,
            url: bookingViewUrl
          });
          toast.success('Booking details shared successfully!');
        } catch (shareError) {
          // Fallback to copying to clipboard if share is cancelled or fails
          console.log('Share cancelled or failed, falling back to clipboard', shareError);
          copyToClipboard(bookingDetails);
        }
      } else {
        // Fallback to copying to clipboard
        copyToClipboard(bookingDetails);
      }
    } catch (error) {
      console.error('Error sharing booking:', error);
      toast.error('Failed to share booking details');
    }
  };
  
  // Helper function to copy booking details to clipboard
  const copyToClipboard = (bookingDetails: any) => {
    const text = `
Cuephoria Booking Confirmation

Customer: ${bookingDetails.customerName}
Station(s): ${bookingDetails.stations}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Duration: ${bookingDetails.duration}

View booking online: ${bookingDetails.viewUrl}
    `;
    
    navigator.clipboard.writeText(text);
    toast.success('Booking details copied to clipboard!');
  };
  
  // Move to next step
  const handleNextStep = () => {
    switch (currentStep) {
      case 1: // Date and time selection
        if (!selectedTimeSlot) {
          toast.error('Please select a time slot');
          return;
        }
        setCurrentStep(2);
        break;
      case 2: // Station selection
        if (selectedStations.length === 0) {
          toast.error('Please select at least one station');
          return;
        }
        setCurrentStep(3);
        break;
      case 3: // Customer information
        if (!customerInfo.name || !customerInfo.phone) {
          toast.error('Please provide your name and phone number');
          return;
        }
        // Basic phone validation
        if (!/^\d{10}$/.test(customerInfo.phone.replace(/\D/g, ''))) {
          toast.error('Please enter a valid 10-digit phone number');
          return;
        }
        // Basic email validation if provided
        if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
          toast.error('Please enter a valid email address');
          return;
        }
        setCurrentStep(4);
        break;
      case 4: // Booking summary
        handleSubmitBooking();
        break;
      default:
        break;
    }
  };
  
  // Move to previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as 1|2|3|4|5);
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'confirmed': { color: 'bg-green-500/20 text-green-500 border-green-500/50', label: 'Confirmed' },
      'in-progress': { color: 'bg-blue-500/20 text-blue-500 border-blue-500/50', label: 'In Progress' },
      'completed': { color: 'bg-purple-500/20 text-purple-500 border-purple-500/50', label: 'Completed' },
      'cancelled': { color: 'bg-red-500/20 text-red-500 border-red-500/50', label: 'Cancelled' },
      'no-show': { color: 'bg-orange-500/20 text-orange-500 border-orange-500/50', label: 'No Show' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-500/20 text-gray-500 border-gray-500/50', label: status };
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };
  
  // Submit booking to server using transaction
  const handleSubmitBooking = async () => {
    if (selectedStations.length === 0 || !selectedDate || !selectedTimeSlot || !customerInfo.name || !customerInfo.phone) {
      toast.error('Missing required booking information');
      return;
    }
    
    setIsSubmitting(true);
    setBookingError(null);
    setBookingIds([]);
    setBookingAccessCode('');
    
    try {
      console.log('Starting booking submission process...');
      
      // Check if customer exists by phone number
      let customerId = customerInfo.customerId;
      
      if (!customerId) {
        console.log('No customer ID provided, checking if customer exists...');
        // Look up customer by phone
        const { data: existingCustomers, error: customerLookupError } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', customerInfo.phone)
          .limit(1);
        
        if (customerLookupError) {
          console.error('Error looking up customer:', customerLookupError);
        }
          
        // If customer exists, use their ID
        if (existingCustomers && existingCustomers.length > 0) {
          customerId = existingCustomers[0].id;
          console.log('Found existing customer with ID:', customerId);
        } else {
          // Create new customer
          console.log('Creating new customer...');
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
            console.error('Error creating customer:', customerError);
            throw new Error('Failed to create customer: ' + customerError.message);
          }
          
          if (!newCustomer) {
            throw new Error('Failed to create customer: No customer ID returned');
          }
          
          customerId = newCustomer.id;
          console.log('Created new customer with ID:', customerId);
        }
      }
      
      if (!customerId) {
        throw new Error('Failed to get customer ID');
      }
      
      // Create a booking group ID for all stations (even if only one)
      const groupId = crypto.randomUUID();
      setBookingGroupId(groupId);
      
      // Calculate the final price with any applicable discounts
      const totalPrice = calculateTotalPrice();
      const discount = discountPercentage > 0 ? discountPercentage : 0;
      
      // Create bookings for each selected station
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const createdBookingIds: string[] = [];
      
      console.log('Creating bookings for date:', formattedDate);
      
      // Perform one final availability check before booking
      const startTimeFormatted = selectedTimeSlot.startTime + ':00';
      const { data: availabilityCheck, error: availabilityError } = await supabase
        .from('bookings')
        .select('id, station_id')
        .eq('booking_date', formattedDate)
        .eq('status', 'confirmed')
        .or(
          `start_time.lte.${startTimeFormatted},end_time.gt.${startTimeFormatted}`,
          `start_time.lt.${selectedTimeSlot.endTime + ':00'},end_time.gte.${selectedTimeSlot.endTime + ':00'}`,
          `start_time.gte.${startTimeFormatted},end_time.lte.${selectedTimeSlot.endTime + ':00'}`
        )
        .in('station_id', selectedStations.map(s => s.id));
      
      if (availabilityError) {
        console.error('Error checking final availability:', availabilityError);
        throw new Error('Could not confirm availability: ' + availabilityError.message);
      }
      
      // Check if the selected slots are still available
      const bookedStationIds = new Set((availabilityCheck || []).map(b => b.station_id));
      const unavailableStations = selectedStations.filter(s => bookedStationIds.has(s.id));
      
      if (unavailableStations.length > 0) {
        const stationNames = unavailableStations.map(s => s.name).join(", ");
        throw new Error(`Some stations are no longer available: ${stationNames}. Please select different stations or try a different time.`);
      }
      
      // Create bookings for each selected station
      const bookings = selectedStations.map(station => ({
        customer_id: customerId,
        station_id: station.id,
        booking_date: formattedDate,
        start_time: selectedTimeSlot.startTime + ':00',
        end_time: selectedTimeSlot.endTime + ':00',
        duration: bookingDuration,
        status: 'confirmed',
        booking_group_id: groupId,
        coupon_code: couponCode || null,
        discount_percentage: discount,
        original_price: station.hourlyRate * (bookingDuration / 60),
        final_price: (station.hourlyRate * (bookingDuration / 60)) * (1 - (discount/100))
      }));
      
      // Insert all bookings
      const { data: newBookings, error: bookingsError } = await supabase
        .from('bookings')
        .insert(bookings)
        .select('id');
        
      if (bookingsError) {
        console.error('Error creating bookings:', bookingsError);
        throw new Error('Failed to create bookings: ' + bookingsError.message);
      }
      
      if (!Array.isArray(newBookings) || newBookings.length === 0) {
        throw new Error('No bookings were created');
      }
      
      // Extract the booking IDs
      createdBookingIds.push(...newBookings.map(b => b.id));
      
      // Get access code for the first booking
      if (createdBookingIds.length > 0) {
        console.log('Getting access code for booking ID:', createdBookingIds[0]);
        
        const { data: accessCodeData, error: accessCodeError } = await supabase
          .from('booking_views')
          .select('access_code')
          .eq('booking_id', createdBookingIds[0])
          .maybeSingle(); // Use maybeSingle instead of single to prevent errors
          
        if (!accessCodeError && accessCodeData) {
          setBookingAccessCode(accessCodeData.access_code);
          console.log('Retrieved access code:', accessCodeData.access_code);
        } else {
          console.warn('Could not retrieve access code:', accessCodeError);
          // Generate a fallback access code
          setBookingAccessCode(createdBookingIds[0].substring(0, 8));
        }
      }
      
      // Set bookings confirmed
      setBookingIds(createdBookingIds);
      setBookingConfirmed(true);
      setCurrentStep(5); // Move to confirmation step
      toast.success(`${selectedStations.length} station(s) booked successfully!`);
      
      // Send booking confirmation email
      if (customerInfo.email) {
        const primaryBookingId = createdBookingIds[0];
        const stationNames = selectedStations.map(s => s.name).join(", ");
        
        try {
          console.log('Sending booking confirmation email...');
          
          const { error: emailError } = await supabase.functions.invoke('send-booking-confirmation', {
            body: {
              bookingId: primaryBookingId,
              bookingGroupId: groupId,
              customerName: customerInfo.name,
              stationName: stationNames,
              bookingDate: format(selectedDate, 'EEEE, MMMM d, yyyy'),
              startTime: selectedTimeSlot.startTime,
              endTime: selectedTimeSlot.endTime,
              duration: bookingDuration,
              bookingReference: bookingAccessCode,
              recipientEmail: customerInfo.email,
              discount: discountPercentage > 0 ? `${discountPercentage}% discount applied` : null,
              finalPrice: totalPrice.toFixed(2),
              totalStations: selectedStations.length
            }
          });
          
          if (emailError) {
            console.error('Error sending email:', emailError);
          } else {
            console.log('Email sent successfully!');
          }
        } catch (emailError) {
          console.error('Error invoking email function:', emailError);
        }
      }
      
      // Refresh today's bookings
      fetchTodayBookings();
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setBookingError(error.message || 'Failed to create booking');
      toast.error(error.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="pt-8 pb-6 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <img 
              src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
              alt="Cuephoria Logo" 
              className="h-16 mb-4" 
            />
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue">
              Book Your Gaming Experience
            </h1>
            <p className="mt-2 text-lg text-gray-300 max-w-2xl">
              Reserve your favorite gaming stations or pool tables in advance
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Today's Bookings */}
          {currentStep !== 5 && (
            <Card className="mb-8 bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <CalendarIcon className="h-5 w-5 mr-2 text-cuephoria-purple" />
                  Today's Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTodayBookings ? (
                  <div className="flex items-center justify-center h-16">
                    <LoadingSpinner className="mr-2" />
                    <span className="text-gray-400">Loading today's bookings...</span>
                  </div>
                ) : todayBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-800">
                          <th className="px-2 py-2 text-left">Time</th>
                          <th className="px-2 py-2 text-left">Station</th>
                          <th className="px-2 py-2 text-left">Customer</th>
                          <th className="px-2 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayBookings.map(booking => {
                          const now = new Date();
                          const currentTime = now.getHours() * 60 + now.getMinutes();
                          const [hours, minutes] = booking.start_time.split(':').map(Number);
                          const bookingTimeInMinutes = hours * 60 + minutes;
                          const isUpcoming = bookingTimeInMinutes - currentTime <= 60 && bookingTimeInMinutes > currentTime;
                          
                          return (
                            <tr 
                              key={booking.id} 
                              className={`border-b border-gray-800 text-gray-300 ${isUpcoming ? 'bg-cuephoria-purple/10' : ''}`}
                            >
                              <td className="px-2 py-2">
                                {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                                {isUpcoming && (
                                  <span className="ml-2 text-xs text-cuephoria-lightpurple">
                                    Upcoming
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-2">
                                {booking.stations.name}
                              </td>
                              <td className="px-2 py-2">
                                {booking.customers.name}
                              </td>
                              <td className="px-2 py-2">
                                {getStatusBadge(booking.status)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No bookings scheduled for today
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        
          {/* Booking Steps Progress */}
          <BookingSteps currentStep={currentStep} />
          
          {/* Booking Form Container */}
          <Card className="mt-8 bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {currentStep === 1 && 'Choose Date & Time'}
                {currentStep === 2 && 'Select Station(s)'}
                {currentStep === 3 && 'Your Information'}
                {currentStep === 4 && 'Booking Summary'}
                {currentStep === 5 && 'Booking Confirmed'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Step 1: Date & Time Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Picker */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <CalendarIcon className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
                        Select Date
                      </h3>
                      <div className="border border-gray-800 rounded-md bg-gray-800/50 p-4">
                        <DatePicker
                          date={selectedDate}
                          onDateChange={handleDateSelect}
                          placeholder="Select booking date"
                        />
                      </div>
                    </div>
                    
                    {/* Duration & Time Slots */}
                    <div className="space-y-6">
                      {/* Duration Selector */}
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
                          Select Duration
                        </h3>
                        <RadioGroup 
                          defaultValue={bookingDuration.toString()}
                          className="grid grid-cols-2 gap-4"
                          onValueChange={handleDurationChange}
                        >
                          <div>
                            <RadioGroupItem 
                              value="60" 
                              id="r1" 
                              className="peer sr-only" 
                            />
                            <Label
                              htmlFor="r1"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-gray-100 peer-data-[state=checked]:border-cuephoria-purple peer-data-[state=checked]:bg-cuephoria-purple/10 cursor-pointer"
                            >
                              <span className="text-lg font-semibold mb-1">1 Hour</span>
                              <span className="text-sm text-gray-400">60 minutes</span>
                            </Label>
                          </div>
                          
                          <div>
                            <RadioGroupItem
                              value="120"
                              id="r2"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="r2"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-gray-100 peer-data-[state=checked]:border-cuephoria-purple peer-data-[state=checked]:bg-cuephoria-purple/10 cursor-pointer"
                            >
                              <span className="text-lg font-semibold mb-1">2 Hours</span>
                              <span className="text-sm text-gray-400">120 minutes</span>
                            </Label>
                          </div>
                          
                          <div>
                            <RadioGroupItem
                              value="180"
                              id="r3"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="r3"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-gray-100 peer-data-[state=checked]:border-cuephoria-purple peer-data-[state=checked]:bg-cuephoria-purple/10 cursor-pointer"
                            >
                              <span className="text-lg font-semibold mb-1">3 Hours</span>
                              <span className="text-sm text-gray-400">180 minutes</span>
                            </Label>
                          </div>
                          
                          <div>
                            <RadioGroupItem
                              value="240"
                              id="r4"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="r4"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-gray-100 peer-data-[state=checked]:border-cuephoria-purple peer-data-[state=checked]:bg-cuephoria-purple/10 cursor-pointer"
                            >
                              <span className="text-lg font-semibold mb-1">4 Hours</span>
                              <span className="text-sm text-gray-400">240 minutes</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Time Slots */}
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
                          Select Time Slot
                        </h3>
                        
                        <TimeSlotGrid 
                          timeSlots={timeSlots}
                          selectedTimeSlot={selectedTimeSlot}
                          loading={loadingTimeSlots}
                          onSelectTimeSlot={handleTimeSlotSelect}
                          isToday={isToday}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Date & Time Summary */}
                  {selectedTimeSlot && (
                    <div className="mt-6 p-4 bg-cuephoria-purple/10 border border-cuephoria-purple/30 rounded-lg">
                      <h4 className="text-lg font-medium mb-2 text-white">Selected Time</h4>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-300">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-cuephoria-lightpurple" />
                          <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-cuephoria-lightpurple" />
                          <span>{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm bg-cuephoria-lightpurple/20 px-2 py-1 rounded">
                            {bookingDuration} minutes
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Station Selection */}
              {currentStep === 2 && (
                <div>
                  <div className="mb-6 p-4 bg-cuephoria-purple/10 border border-cuephoria-purple/30 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-cuephoria-lightpurple">Stations available for {selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}:</span> 
                      {' '}Select one or more stations for your booking.
                    </p>
                  </div>
                  
                  {/* Available stations for selected time */}
                  <AvailableStationsGrid 
                    stations={availableStations}
                    selectedStations={selectedStations}
                    loading={loadingStations}
                    timeSlot={selectedTimeSlot}
                    onStationSelect={handleStationSelect}
                    multiSelect={true}
                  />
                  
                  {/* Controller Availability for PS5 */}
                  {availableStations.some(s => s.type === 'ps5') && (
                    <div className="mt-6 p-4 bg-gray-800/40 border border-gray-700 rounded-lg">
                      <ControllerManagement 
                        totalControllers={totalControllers}
                        availableControllers={availableControllers}
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Note: Each PS5 station requires one controller. We have {totalControllers} controllers in total.
                      </p>
                    </div>
                  )}
                  
                  {selectedStations.length > 0 && (
                    <div className="mt-6 p-4 bg-cuephoria-purple/10 border border-cuephoria-purple/30 rounded-lg">
                      <h4 className="text-lg font-medium mb-2 text-white">Selected Stations ({selectedStations.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStations.map(station => (
                          <div key={station.id} className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                            <span className="text-sm text-gray-200">{station.name}</span>
                            <button 
                              onClick={() => handleStationSelect(station)}
                              className="ml-2 text-gray-400 hover:text-white"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 3: Customer Information */}
              {currentStep === 3 && (
                <CustomerInfoForm 
                  customerInfo={customerInfo}
                  onChange={handleCustomerInfoChange}
                />
              )}
              
              {/* Step 4: Booking Summary */}
              {currentStep === 4 && (
                <BookingSummary 
                  stations={selectedStations}
                  date={selectedDate}
                  timeSlot={selectedTimeSlot!}
                  duration={bookingDuration}
                  customerInfo={customerInfo}
                  couponCode={couponCode}
                  onCouponApply={handleCouponApply}
                />
              )}
              
              {/* Step 5: Booking Confirmation */}
              {currentStep === 5 && (
                <BookingConfirmation 
                  bookingId={bookingIds[0]} 
                  bookingGroupId={bookingGroupId || undefined}
                  stations={selectedStations}
                  date={selectedDate}
                  timeSlot={selectedTimeSlot!}
                  duration={bookingDuration}
                  customerInfo={customerInfo}
                  discountPercentage={discountPercentage}
                  originalPrice={selectedStations.reduce((sum, station) => 
                    sum + (station.hourlyRate * (bookingDuration / 60)), 0
                  )}
                  finalPrice={calculateTotalPrice()}
                  couponCode={couponCode}
                />
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              {currentStep < 5 && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Back
                  </Button>
                  
                  <Button 
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-cuephoria-purple hover:bg-cuephoria-purple/90"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner className="mr-2" /> Processing...
                      </>
                    ) : currentStep === 4 ? (
                      'Confirm Booking'
                    ) : (
                      <>
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {currentStep === 5 && (
                <>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="w-full sm:w-auto"
                    variant="outline"
                  >
                    Return to Home
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      // Reset form for new booking
                      setCurrentStep(1);
                      setSelectedStations([]);
                      setSelectedDate(new Date());
                      setSelectedTimeSlot(null);
                      setCustomerInfo({
                        name: '',
                        phone: '',
                        email: '',
                        isExistingCustomer: false
                      });
                      setCouponCode('');
                      setDiscountPercentage(0);
                      setBookingConfirmed(false);
                      setBookingIds([]);
                    }}
                    className="w-full sm:w-auto bg-cuephoria-purple hover:bg-cuephoria-purple/90"
                  >
                    Book Another Session
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookNow;
