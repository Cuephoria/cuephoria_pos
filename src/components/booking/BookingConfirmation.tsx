import React from 'react';
import { format } from 'date-fns';
import { Station } from '@/types/pos.types';
import { CheckCircle2, Copy, Share2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BookingConfirmationProps {
  bookingId: string;
  bookingGroupId?: string;
  stations: Station[];
  date: Date;
  timeSlot: {
    startTime: string;
    endTime: string;
  } | null; // Allow null for timeSlot
  duration: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  discountPercentage: number;
  originalPrice: number;
  finalPrice: number;
  couponCode?: string;
}

const BookingConfirmation = ({
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
}: BookingConfirmationProps) => {
  // Protect against null timeSlot
  if (!timeSlot) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-800/70 border border-gray-700 rounded-lg">
        <p className="text-gray-400">No time slot information available.</p>
      </div>
    );
  }

  const handleCopyBookingInfo = () => {
    const bookingInfo = `
Cuephoria Booking Details

Customer: ${customerInfo.name}
Date: ${format(date, 'EEEE, MMMM d, yyyy')}
Time: ${timeSlot.startTime} - ${timeSlot.endTime}
Duration: ${duration} minutes
Station(s): ${stations.map(s => s.name).join(', ')}
Booking Reference: ${bookingId.substring(0, 8)}
    `;
    
    navigator.clipboard.writeText(bookingInfo.trim());
    toast.success('Booking details copied to clipboard!');
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cuephoria-purple/20 mb-4">
          <CheckCircle2 className="h-10 w-10 text-cuephoria-purple" />
        </div>
        <h3 className="text-2xl font-bold text-white">Booking Confirmed!</h3>
        <p className="mt-2 text-gray-400">
          Your booking reference is <span className="font-medium text-cuephoria-lightpurple">{bookingId.substring(0, 8)}</span>
        </p>
      </div>
      
      <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <h4 className="text-gray-300 font-medium">Customer</h4>
            <p className="text-white">{customerInfo.name}</p>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <h4 className="text-gray-300 font-medium">Date & Time</h4>
            <div className="text-right">
              <p className="text-white">{format(date, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-400">{timeSlot.startTime} - {timeSlot.endTime}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <h4 className="text-gray-300 font-medium">Station(s)</h4>
            <div className="text-right">
              <p className="text-white">{stations.map(s => s.name).join(', ')}</p>
              <p className="text-sm text-gray-400">{duration} minutes</p>
            </div>
          </div>
          
          {discountPercentage > 0 && (
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h4 className="text-gray-300 font-medium">Discount</h4>
              <p className="text-cuephoria-lightpurple">{discountPercentage}% off</p>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <h4 className="text-gray-300 font-medium">Total Amount</h4>
            <div className="text-right">
              {discountPercentage > 0 && (
                <p className="text-sm text-gray-400 line-through">₹{originalPrice.toFixed(2)}</p>
              )}
              <p className="text-lg font-bold text-cuephoria-lightpurple">₹{finalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Alert className="bg-cuephoria-purple/10 border-cuephoria-purple/30 text-cuephoria-lightpurple">
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription className="text-gray-300">
          <p>Please arrive 10 minutes before your booking time. Your booking will be held for 30 minutes after the start time, after which it may be canceled.</p>
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button 
          onClick={handleCopyBookingInfo} 
          variant="outline" 
          className="flex-1 gap-2"
        >
          <Copy className="h-4 w-4" /> Copy Details
        </Button>
        <Button 
          variant="default" 
          className="flex-1 gap-2 bg-cuephoria-purple hover:bg-cuephoria-purple/90"
        >
          <Share2 className="h-4 w-4" /> Share Booking
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
