
import React from 'react';
import { BookingContext } from './BookingContext';
import { useBookingProvider } from '@/hooks/booking/useBookingProvider';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const bookingState = useBookingProvider();

  return (
    <BookingContext.Provider value={bookingState}>
      {children}
    </BookingContext.Provider>
  );
};
