
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Station } from '@/types/pos.types';
import { CalendarIcon, Check, ChevronRight, Clock, Gamepad2, Table2 } from 'lucide-react';
import BookingSteps from '@/components/booking/BookingSteps';
import StationSelector from '@/components/booking/StationSelector';
import TimeSlotGrid from '@/components/booking/TimeSlotGrid';
import CustomerInfoForm from '@/components/booking/CustomerInfoForm';
import BookingSummary from '@/components/booking/BookingSummary';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { generateTimeSlots } from '@/utils/booking.utils';

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
  // Current booking step
  const [currentStep, setCurrentStep] = useState<1|2|3|4|5>(1);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingDuration, setBookingDuration] = useState<number>(60); // in minutes
  
  // Station selection
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stationType, setStationType] = useState<'ps5'|'8ball'|'all'>('all');
  const [loadingStations, setLoadingStations] = useState<boolean>(true);
  
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
  
  // Booking summary
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch stations on component mount
  useEffect(() => {
    fetchStations();
  }, []);
  
  // Filter available stations by type when stationType changes
  useEffect(() => {
    if (selectedStation && 
        stationType !== 'all' && 
        selectedStation.type !== stationType) {
      setSelectedStation(null);
    }
  }, [stationType, selectedStation]);
  
  // Fetch available time slots when date or selected station changes
  useEffect(() => {
    if (selectedStation && selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDate, selectedStation, bookingDuration]);

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

  // Function to fetch available time slots for the selected date and station
  const fetchAvailableTimeSlots = async () => {
    if (!selectedStation || !selectedDate) return;
    
    setLoadingTimeSlots(true);
    setSelectedTimeSlot(null);
    
    try {
      // Format date for API call (YYYY-MM-DD)
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Call the get_available_slots function via RPC
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_date: formattedDate,
        p_station_id: selectedStation.id,
        p_slot_duration: bookingDuration
      });
      
      if (error) {
        throw error;
      }
      
      // Transform data to our TimeSlot format
      const availableSlots: TimeSlot[] = data.map((slot: any) => ({
        startTime: slot.start_time.substring(0, 5), // Get HH:MM from HH:MM:SS
        endTime: slot.end_time.substring(0, 5), // Get HH:MM from HH:MM:SS
        isAvailable: slot.is_available
      }));
      
      setTimeSlots(availableSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load available time slots');
      
      // Generate fallback time slots if API call fails
      const fallbackSlots = generateTimeSlots('10:00', '22:00', bookingDuration);
      setTimeSlots(fallbackSlots);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Handle station type filter change
  const handleStationTypeChange = (type: 'ps5' | '8ball' | 'all') => {
    setStationType(type);
    setSelectedStation(null); // Reset selection when filter changes
  };
  
  // Handle station selection 
  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    if (currentStep === 1) {
      setCurrentStep(2); // Move to date & time selection
    }
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };

  // Handle date selection 
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot(null); // Reset time slot when date changes
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
  
  // Move to next step
  const handleNextStep = () => {
    switch (currentStep) {
      case 1: // Station selection
        if (!selectedStation) {
          toast.error('Please select a station');
          return;
        }
        setCurrentStep(2);
        break;
      case 2: // Date and time selection
        if (!selectedTimeSlot) {
          toast.error('Please select a time slot');
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
    if (!selectedStation || !selectedDate || !selectedTimeSlot || !customerInfo.name || !customerInfo.phone) {
      toast.error('Missing required booking information');
      return;
    }
    
    setIsSubmitting(true);
    setBookingError(null);
    
    try {
      // Check if customer exists by phone number
      let customerId = customerInfo.customerId;
      
      if (!customerId) {
        // Look up customer by phone
        const { data: existingCustomers } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', customerInfo.phone)
          .limit(1);
          
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
            
          if (customerError) throw customerError;
          customerId = newCustomer.id;
        }
      }
      
      // Create booking
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          station_id: selectedStation.id,
          customer_id: customerId,
          booking_date: formattedDate,
          start_time: selectedTimeSlot.startTime,
          end_time: selectedTimeSlot.endTime,
          duration: bookingDuration,
          status: 'confirmed',
          notes: ''
        })
        .select()
        .single();
        
      if (bookingError) throw bookingError;
      
      // Set booking confirmed
      setBookingId(newBooking.id);
      setBookingConfirmed(true);
      setCurrentStep(5); // Move to confirmation step
      toast.success('Booking confirmed!');
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setBookingError(error.message || 'Failed to create booking');
      toast.error('Booking failed. Please try again.');
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
              Book Your Gaming Session
            </h1>
            <p className="mt-2 text-lg text-gray-300 max-w-2xl">
              Reserve your favorite gaming station or pool table in advance
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Booking Steps Progress */}
          <BookingSteps currentStep={currentStep} />
          
          {/* Booking Form Container */}
          <Card className="mt-8 bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {currentStep === 1 && 'Select a Station'}
                {currentStep === 2 && 'Choose Date & Time'}
                {currentStep === 3 && 'Your Information'}
                {currentStep === 4 && 'Booking Summary'}
                {currentStep === 5 && 'Booking Confirmed'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Step 1: Station Selection */}
              {currentStep === 1 && (
                <StationSelector 
                  stations={stations}
                  selectedStation={selectedStation}
                  stationType={stationType}
                  loading={loadingStations}
                  onStationTypeChange={handleStationTypeChange}
                  onStationSelect={handleStationSelect}
                />
              )}
              
              {/* Step 2: Date & Time Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Picker */}
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <CalendarIcon className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
                        Select Date
                      </h3>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          // Disable dates before today
                          return date < new Date(new Date().setHours(0,0,0,0));
                        }}
                        className="p-3 pointer-events-auto border border-gray-800 rounded-md bg-gray-800/50"
                      />
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
                  station={selectedStation!}
                  date={selectedDate}
                  timeSlot={selectedTimeSlot!}
                  duration={bookingDuration}
                  customerInfo={customerInfo}
                />
              )}
              
              {/* Step 5: Booking Confirmation */}
              {currentStep === 5 && (
                <BookingConfirmation 
                  bookingId={bookingId}
                  station={selectedStation!}
                  date={selectedDate}
                  timeSlot={selectedTimeSlot!}
                  duration={bookingDuration}
                  customerInfo={customerInfo}
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
                      setSelectedStation(null);
                      setSelectedDate(new Date());
                      setSelectedTimeSlot(null);
                      setCustomerInfo({
                        name: '',
                        phone: '',
                        email: '',
                        isExistingCustomer: false
                      });
                      setBookingConfirmed(false);
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
