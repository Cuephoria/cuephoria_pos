
import React from 'react';
import { BookingProvider } from '@/context/BookingProvider';
import BookNowContainer from './book-now/BookNowContainer';

/**
 * Main BookNow page component - uses context provider pattern for state management
 */
const BookNowPage: React.FC = () => {
  return (
    <BookingProvider>
      <BookNowContainer />
    </BookingProvider>
  );
};

export default BookNowPage;
