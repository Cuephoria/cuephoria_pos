
import React from 'react';
import { Station } from '@/types/pos.types';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  isExistingCustomer: boolean;
  customerId?: string;
}

interface BookingConfirmationSectionProps {
  bookingId: string;
  bookingGroupId?: string;
  stations: Station[];
  date: Date;
  timeSlot: TimeSlot;
  duration: number;
  customerInfo: CustomerInfo;
  discountPercentage: number;
  originalPrice: number;
  finalPrice: number;
  couponCode: string;
}

const BookingConfirmationSection: React.FC<BookingConfirmationSectionProps> = ({
  bookingId,
  bookingGroupId,
  stations,
  date,
  timeSlot,
  duration,
  customerInfo,
  discountPercentage,
  originalPrice,
  finalPrice,
  couponCode
}) => {
  return (
    <BookingConfirmation
      bookingId={bookingId}
      bookingGroupId={bookingGroupId}
      stations={stations}
      date={date}
      timeSlot={timeSlot}
      duration={duration}
      customerInfo={customerInfo}
      discountPercentage={discountPercentage}
      originalPrice={originalPrice}
      finalPrice={finalPrice}
      couponCode={couponCode}
    />
  );
};

export default BookingConfirmationSection;
