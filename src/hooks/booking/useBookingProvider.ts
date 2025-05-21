import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Station } from '@/types/pos.types';
import { isDateInPast } from '@/utils/booking';
import { CustomerInfo, TimeSlot } from '@/context/BookingContext';
import { useTimeSlots } from './useTimeSlots';
import { useStationBooking } from './useStationBooking';
import { useTodayBookings } from './useTodayBookings';

/**
 * Hook that provides all state and functions for the booking process
 */
export const useBookingProvider = () => {
  // Current booking step
  const [currentStep, setCurrentStep] = useState<1|2|3|4|5>(1);

  // Date and Time selection
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingDuration, setBookingDuration] = useState<number>(60); // in minutes
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  
  // Use our new optimized hooks
  const { 
    timeSlots, 
    loading: loadingTimeSlots, 
    isToday,
    refreshTimeSlots
  } = useTimeSlots({ 
    date: selectedDate, 
    duration: bookingDuration 
  });
  
  const {
    todayBookings,
    groupedBookings,
    bookingTimeSlots,
    loading: loadingTodayBookings,
    fetchTodayBookings
  } = useTodayBookings();

  // Station selection
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStations, setSelectedStations] = useState<Station[]>([]);
  const [stationType, setStationType] = useState<'ps5'|'8ball'|'all'>('all');
  const [loadingStations, setLoadingStations] = useState<boolean>(false);
  
  // Controller management
  const [totalControllers, setTotalControllers] = useState<number>(6);
  const [availableControllers, setAvailableControllers] = useState<number>(6);
  
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
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  
  // Booking summary
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  // Add the missing state variables for booking IDs, access code, and group ID
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [bookingAccessCode, setBookingAccessCode] = useState<string>('');
  const [bookingGroupId, setBookingGroupId] = useState<string | null>(null);
  
  // Use our optimized booking submission hook
  const {
    submitBooking,
    isSubmitting,
    bookingError,
    bookingIds: submittedBookingIds,
    bookingAccessCode: submittedAccessCode,
    bookingGroupId: submittedGroupId
  } = useStationBooking({
    onBookingConfirmed: (ids, groupId, accessCode) => {
      setBookingIds(ids);
      setBookingGroupId(groupId);
      setBookingAccessCode(accessCode);
      setBookingConfirmed(true);
      setCurrentStep(5); // Move to confirmation step
      toast.success(`${selectedStations.length} station(s) booked successfully!`);
      fetchTodayBookings(); // Refresh today's bookings after a new booking
    },
    onBookingError: (error) => {
      toast.error(error || 'Booking failed. Please try again.');
    }
  });

  // Initialize component
  useEffect(() => {
    document.title = "Book Now | Cuephoria";
    fetchStations();
  }, []);
  
  // Reset selected stations when time slot changes
  useEffect(() => {
    setSelectedStations([]);
  }, [selectedTimeSlot]);
  
  // Filter available stations by type when stationType changes
  useEffect(() => {
    if (selectedStations.length > 0 && 
        stationType !== 'all') {
      setSelectedStations(selectedStations.filter(station => station.type === stationType));
    }
  }, [stationType]);
  
  // Update controller availability for PS5 stations
  useEffect(() => {
    if (selectedTimeSlot && selectedStations.some(station => station.type === 'ps5')) {
      updateControllerAvailability();
    }
  }, [selectedTimeSlot, selectedStations]);

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

  // Function to fetch stations from database with caching
  const stationsCache: Station[] = [];
  let lastStationsFetchTime = 0;
  const STATIONS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchStations = async () => {
    setLoadingStations(true);
    
    try {
      // Use cached data if available and not expired
      if (stationsCache.length > 0 && (Date.now() - lastStationsFetchTime < STATIONS_CACHE_DURATION)) {
        console.log('Using cached stations data');
        setStations(stationsCache);
        setLoadingStations(false);
        return;
      }
      
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
      
      // Update cache
      stationsCache.length = 0;
      stationsCache.push(...transformedStations);
      lastStationsFetchTime = Date.now();
      
      setStations(transformedStations);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setLoadingStations(false);
    }
  };

  // Handle station type filter change
  const handleStationTypeChange = (type: 'ps5' | '8ball' | 'all') => {
    setStationType(type);
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
    
    // Reset selected stations when time slot changes
    setSelectedStations([]);
  };

  // Handle date selection 
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Don't allow selecting dates in the past
      if (isDateInPast(date)) {
        toast.error("You cannot book dates in the past");
        return;
      }
      
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time slot when date changes
      setSelectedStations([]); // Reset selected stations when date changes
    }
  };
  
  // Handle duration change
  const handleDurationChange = (duration: string) => {
    const durationMinutes = parseInt(duration);
    setBookingDuration(durationMinutes);
    setSelectedTimeSlot(null); // Reset time slot when duration changes
    setSelectedStations([]); // Reset selected stations when duration changes
  };

  // Handle customer information form changes
  const handleCustomerInfoChange = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  // Handle coupon code application - fixed to prevent multiple toasts
  const handleCouponApply = (code: string) => {
    // Prevent applying coupon multiple times
    if (couponCode === code && couponApplied) {
      toast.info('This coupon is already applied');
      return;
    }
    
    setCouponCode(code);
    
    // Simple validation for the coupon code
    if (code.toLowerCase() === 'cuephoria50') {
      setDiscountPercentage(50); // 50% discount
      setCouponApplied(true);
      toast.success('50% discount applied!');
    } else {
      setDiscountPercentage(0);
      setCouponApplied(false);
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
  
  // Submit booking to server
  const handleSubmitBooking = async () => {
    await submitBooking({
      selectedStations,
      selectedDate,
      selectedTimeSlot,
      bookingDuration,
      customerInfo,
      couponCode,
      discountPercentage
    });
  };

  // Reset form for new booking
  const resetBookingForm = () => {
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
    setCouponApplied(false);
    setBookingConfirmed(false);
    setBookingIds([]);
    setBookingAccessCode('');
    setBookingGroupId(null);
  };

  return {
    // Current booking step
    currentStep,
    setCurrentStep,

    // Date and Time
    selectedDate,
    setSelectedDate,
    bookingDuration,
    setBookingDuration,
    timeSlots,
    selectedTimeSlot,
    setSelectedTimeSlot,
    loadingTimeSlots,
    isToday,
    fetchAvailableTimeSlots: refreshTimeSlots,

    // Stations
    stations,
    selectedStations,
    setSelectedStations,
    stationType,
    setStationType,
    loadingStations,
    
    // Controller management
    totalControllers,
    availableControllers,
    
    // Customer information
    customerInfo,
    setCustomerInfo,
    
    // Coupon code
    couponCode,
    setCouponCode,
    discountPercentage,
    setDiscountPercentage,
    
    // Today's bookings
    todayBookings,
    bookingTimeSlots,
    groupedBookings,
    loadingTodayBookings,
    fetchTodayBookings,
    
    // Booking actions
    handleDateSelect,
    handleDurationChange,
    handleTimeSlotSelect,
    handleStationSelect,
    handleStationTypeChange,
    handleCustomerInfoChange,
    handleCouponApply,
    calculateTotalPrice,
    
    // Booking submission
    bookingConfirmed,
    setBookingConfirmed,
    bookingIds,
    bookingAccessCode,
    isSubmitting,
    bookingError,
    bookingGroupId,
    handleSubmitBooking,
    handleNextStep,
    handlePreviousStep,
    resetBookingForm
  };
};
