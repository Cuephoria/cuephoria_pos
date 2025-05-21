
import React from 'react';
import { Station } from '@/types/pos.types';
import BookingSummary from '@/components/booking/BookingSummary';

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

interface BookingSummarySectionProps {
  stations: Station[];
  date: Date;
  timeSlot: TimeSlot;
  duration: number;
  customerInfo: CustomerInfo;
  couponCode: string;
  onCouponApply: (code: string) => void;
}

const BookingSummarySection: React.FC<BookingSummarySectionProps> = ({
  stations,
  date,
  timeSlot,
  duration,
  customerInfo,
  couponCode,
  onCouponApply
}) => {
  return (
    <BookingSummary
      stations={stations}
      date={date}
      timeSlot={timeSlot}
      duration={duration}
      customerInfo={customerInfo}
      couponCode={couponCode}
      onCouponApply={onCouponApply}
    />
  );
};

export default BookingSummarySection;
