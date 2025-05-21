
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Station } from '@/types/pos.types';
import { CalendarIcon, Check, Clock, Copy, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import QRCode from 'qrcode.react';

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

interface BookingConfirmationProps {
  bookingId: string;
  station: Station;
  date: Date;
  timeSlot: TimeSlot;
  duration: number;
  customerInfo: CustomerInfo;
}

const BookingConfirmation = ({
  bookingId,
  station,
  date,
  timeSlot,
  duration,
  customerInfo
}: BookingConfirmationProps) => {
  const [copied, setCopied] = useState(false);
  
  // Format booking reference for display
  const formatBookingReference = () => {
    return bookingId.substring(0, 8).toUpperCase();
  };
  
  // Handle copy booking reference
  const copyBookingReference = () => {
    navigator.clipboard.writeText(formatBookingReference());
    setCopied(true);
    toast.success('Booking reference copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Create shareable booking text
  const shareableText = `I've booked ${station.name} at Cuephoria on ${format(date, 'MMM d')} at ${timeSlot.startTime}. Booking reference: ${formatBookingReference()}`;
  
  // Handle share booking
  const shareBooking = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Cuephoria Booking',
          text: shareableText
        });
      } else {
        navigator.clipboard.writeText(shareableText);
        toast.success('Booking details copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success message */}
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cuephoria-purple/20 flex items-center justify-center">
          <Check className="h-8 w-8 text-cuephoria-lightpurple" />
        </div>
        <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
        <p className="text-gray-400 mt-2">
          Your booking has been successfully confirmed
        </p>
      </div>
      
      {/* Booking reference */}
      <div className="bg-cuephoria-purple/10 border border-cuephoria-purple/30 rounded-lg p-4 text-center">
        <span className="text-sm text-gray-400">Booking Reference</span>
        <div className="flex items-center justify-center mt-1">
          <span className="text-2xl font-mono font-bold text-cuephoria-lightpurple">
            {formatBookingReference()}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-2"
            onClick={copyBookingReference}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Booking details */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 divide-y divide-gray-700">
        <div className="p-4">
          <h4 className="font-medium text-white mb-2">Booking Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Station:</span>
              <span>{station.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Date:</span>
              <div className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1 text-cuephoria-lightpurple" />
                <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Time:</span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-cuephoria-lightpurple" />
                <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span>{duration} minutes</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h4 className="font-medium text-white mb-2">Customer</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span>{customerInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phone:</span>
              <span>{customerInfo.phone}</span>
            </div>
            {customerInfo.email && (
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span>{customerInfo.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* QR Code */}
      <div className="mt-6 text-center">
        <h4 className="font-medium text-white mb-3">Show this at arrival</h4>
        <div className="bg-white inline-block p-3 rounded-lg">
          <QRCode 
            value={`BOOKING:${bookingId}`}
            size={120}
            renderAs="svg"
            includeMargin={false}
          />
        </div>
      </div>
      
      {/* Share and Download buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Button variant="outline" onClick={shareBooking}>
          <Share2 className="mr-2 h-4 w-4" /> Share Booking
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
