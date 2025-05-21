
import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Station } from '@/types/pos.types';
import { isDateInPast } from '@/utils/booking';

// Define types
export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  isExistingCustomer: boolean;
  customerId?: string;
}

interface BookingContextType {
  // Current booking step
  currentStep: 1 | 2 | 3 | 4 | 5;
  setCurrentStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4 | 5>>;

  // Date and Time
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  bookingDuration: number;
  setBookingDuration: React.Dispatch<React.SetStateAction<number>>;
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  setSelectedTimeSlot: React.Dispatch<React.SetStateAction<TimeSlot | null>>;
  loadingTimeSlots: boolean;
  isToday: boolean;
  fetchAvailableTimeSlots: () => Promise<void>;

  // Stations
  stations: Station[];
  selectedStations: Station[];
  setSelectedStations: React.Dispatch<React.SetStateAction<Station[]>>;
  stationType: 'ps5' | '8ball' | 'all';
  setStationType: React.Dispatch<React.SetStateAction<'ps5' | '8ball' | 'all'>>;
  loadingStations: boolean;
  
  // Controller management
  totalControllers: number;
  availableControllers: number;
  
  // Customer information
  customerInfo: CustomerInfo;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  
  // Coupon code
  couponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  discountPercentage: number;
  setDiscountPercentage: React.Dispatch<React.SetStateAction<number>>;
  
  // Today's bookings
  todayBookings: any[];
  bookingTimeSlots: string[];
  groupedBookings: Record<string, any[]>;
  loadingTodayBookings: boolean;
  fetchTodayBookings: () => Promise<void>;
  
  // Booking actions
  handleDateSelect: (date: Date | undefined) => void;
  handleDurationChange: (duration: string) => void;
  handleTimeSlotSelect: (slot: TimeSlot) => void;
  handleStationSelect: (station: Station) => void;
  handleStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
  handleCustomerInfoChange: (info: CustomerInfo) => void;
  handleCouponApply: (code: string) => void;
  calculateTotalPrice: () => number;
  
  // Booking submission
  bookingConfirmed: boolean;
  setBookingConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  bookingIds: string[];
  setBookingIds: React.Dispatch<React.SetStateAction<string[]>>;
  bookingAccessCode: string;
  setBookingAccessCode: React.Dispatch<React.SetStateAction<string>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  bookingError: string | null;
  setBookingError: React.Dispatch<React.SetStateAction<string | null>>;
  bookingGroupId: string | null;
  setBookingGroupId: React.Dispatch<React.SetStateAction<string | null>>;
  handleSubmitBooking: () => Promise<void>;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  resetBookingForm: () => void;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We'll implement the provider in a separate file
  return <></>;
};
