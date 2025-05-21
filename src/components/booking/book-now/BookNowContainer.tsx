
import React from 'react';
import { useBookingContext } from '@/context/BookingContext';
import BookingSteps from '@/components/booking/BookingSteps';
import BookNowHeader from '@/components/booking/book-now/BookNowHeader';
import TodaysBookings from '@/components/booking/book-now/TodaysBookings';
import DateTimeSection from '@/components/booking/book-now/DateTimeSection';
import StationSelectionSection from '@/components/booking/book-now/StationSelectionSection';
import CustomerInfoSection from '@/components/booking/book-now/CustomerInfoSection';
import BookingSummarySection from '@/components/booking/book-now/BookingSummarySection';
import BookingConfirmationSection from '@/components/booking/book-now/BookingConfirmationSection';
import BookNowFooter from '@/components/booking/book-now/BookNowFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Container component for the BookNow page
 * Uses context to access booking state and functions
 */
const BookNowContainer = () => {
  const {
    // Basic state
    currentStep,
    
    // Date and Time
    selectedDate,
    bookingDuration,
    timeSlots,
    selectedTimeSlot,
    isToday,
    loadingTimeSlots,
    
    // Stations
    stations,
    selectedStations,
    stationType,
    loadingStations,
    
    // Controllers
    totalControllers,
    availableControllers,
    
    // Customer
    customerInfo,
    
    // Coupon
    couponCode,
    discountPercentage,
    
    // Today's bookings
    todayBookings,
    bookingTimeSlots,
    groupedBookings,
    loadingTodayBookings,
    
    // Booking submission
    bookingIds,
    bookingGroupId,
    
    // Actions
    handleDateSelect,
    handleDurationChange,
    handleTimeSlotSelect,
    handleStationSelect,
    handleStationTypeChange,
    handleCustomerInfoChange,
    handleCouponApply,
    calculateTotalPrice,
    handleNextStep,
    handlePreviousStep,
    resetBookingForm,
    isSubmitting
  } = useBookingContext();

  // Show today's bookings only if we're on the appropriate step
  const showTodaysBookings = currentStep !== 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <BookNowHeader />

      {/* Main Content */}
      <main className="pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Today's Bookings - Only show when needed */}
          {showTodaysBookings && (
            <TodaysBookings 
              todayBookings={todayBookings}
              bookingTimeSlots={bookingTimeSlots}
              groupedBookings={groupedBookings}
              loading={loadingTodayBookings}
            />
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
                <DateTimeSection 
                  selectedDate={selectedDate} 
                  selectedTimeSlot={selectedTimeSlot}
                  timeSlots={timeSlots}
                  bookingDuration={bookingDuration}
                  isToday={isToday}
                  loadingTimeSlots={loadingTimeSlots}
                  onDateSelect={handleDateSelect}
                  onDurationChange={handleDurationChange}
                  onTimeSlotSelect={handleTimeSlotSelect}
                />
              )}
              
              {/* Step 2: Station Selection */}
              {currentStep === 2 && (
                <StationSelectionSection 
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  stationType={stationType}
                  selectedStations={selectedStations}
                  stations={stations}
                  availableControllers={availableControllers}
                  totalControllers={totalControllers}
                  loadingStations={loadingStations}
                  onStationSelect={handleStationSelect}
                  onStationTypeChange={handleStationTypeChange}
                />
              )}
              
              {/* Step 3: Customer Information */}
              {currentStep === 3 && (
                <CustomerInfoSection 
                  customerInfo={customerInfo}
                  onChange={handleCustomerInfoChange}
                />
              )}
              
              {/* Step 4: Booking Summary */}
              {currentStep === 4 && (
                <BookingSummarySection 
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
                <BookingConfirmationSection 
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
            
            <BookNowFooter 
              currentStep={currentStep}
              isSubmitting={isSubmitting}
              onPreviousStep={handlePreviousStep}
              onNextStep={handleNextStep}
              onBookAnother={resetBookingForm}
            />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookNowContainer;

