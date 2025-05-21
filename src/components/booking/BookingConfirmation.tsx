
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Station } from '@/types/pos.types';
import { CalendarIcon, Check, Clock, Copy, Share2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  bookingGroupId?: string;
  stations: Station[];
  date: Date;
  timeSlot: TimeSlot;
  duration: number;
  customerInfo: CustomerInfo;
  discountPercentage?: number;
  originalPrice?: number;
  finalPrice?: number;
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
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Format booking reference for display
  const formatBookingReference = () => {
    return bookingId.substring(0, 8).toUpperCase();
  };
  
  // Group stations by type for better presentation
  const groupedStations = stations.reduce((groups, station) => {
    if (!groups[station.type]) {
      groups[station.type] = [];
    }
    groups[station.type].push(station);
    return groups;
  }, {} as Record<string, Station[]>);
  
  // Handle copy booking reference
  const copyBookingReference = () => {
    navigator.clipboard.writeText(formatBookingReference());
    setCopied(true);
    toast.success('Booking reference copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Create shareable booking text
  const stationsText = stations.length > 1 
    ? `${stations.length} stations at Cuephoria` 
    : `${stations[0].name} at Cuephoria`;
    
  const shareableText = `I've booked ${stationsText} on ${format(date, 'MMM d')} at ${timeSlot.startTime}. Booking reference: ${formatBookingReference()}`;
  
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

  // Send confirmation email
  const sendConfirmationEmail = async () => {
    if (!customerInfo.email) {
      toast.error('No email address provided');
      return;
    }

    try {
      setSendingEmail(true);
      setEmailError(null);
      
      // Get station names
      const stationNames = stations.map(s => s.name).join(", ");

      console.log('Preparing to send email confirmation to:', customerInfo.email);
      console.log('Booking ID:', bookingId);
      
      // Call the send-booking-confirmation edge function
      const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          bookingId,
          bookingGroupId,
          customerName: customerInfo.name,
          stationName: stationNames,
          bookingDate: format(date, 'EEEE, MMMM d, yyyy'),
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          duration,
          bookingReference: formatBookingReference(),
          recipientEmail: customerInfo.email,
          discount: discountPercentage ? `${discountPercentage}% discount applied` : null,
          finalPrice: finalPrice ? finalPrice.toFixed(2) : null,
          totalStations: stations.length
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        setEmailError(error.message || 'Failed to send email. Please try again.');
        throw new Error(`Failed to send email: ${error.message}`);
      }
      
      console.log('Email sending response:', data);
      setEmailSent(true);
      toast.success('Confirmation email sent successfully');
    } catch (error: any) {
      console.error('Error sending email:', error);
      setEmailError(error.message || 'Failed to send confirmation email');
      toast.error('Failed to send confirmation email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Send email if customer provided an email address
  useEffect(() => {
    if (customerInfo.email && !emailSent) {
      sendConfirmationEmail();
    }
  }, []);
  
  // Calculate price if not provided
  const displayOriginalPrice = originalPrice || stations.reduce((sum, station) => 
    sum + (station.hourlyRate * (duration / 60)), 0
  );
  
  const displayFinalPrice = finalPrice || (discountPercentage 
    ? displayOriginalPrice * (1 - (discountPercentage / 100)) 
    : displayOriginalPrice);
  
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
          {customerInfo.email && emailSent && " and a confirmation email has been sent"}
        </p>
      </div>
      
      {/* Email error message */}
      {emailError && (
        <Alert variant="destructive" className="bg-red-950/30 border-red-800 text-red-300">
          <AlertTitle>Failed to send email</AlertTitle>
          <AlertDescription>
            We couldn't send your confirmation email. You can try again using the button below.
          </AlertDescription>
        </Alert>
      )}
      
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
            {/* Show stations grouped by type */}
            <div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400">
                  {stations.length > 1 ? 'Stations:' : 'Station:'}
                </span>
                <div className="text-right">
                  {Object.entries(groupedStations).map(([type, typeStations]) => (
                    <div key={type} className="mb-2">
                      <div className="font-medium">
                        {type === 'ps5' ? 'PlayStation 5' : '8-Ball Pool'} 
                        <span className="text-xs ml-1">({typeStations.length})</span>
                      </div>
                      {typeStations.map(station => (
                        <div key={station.id} className="text-sm text-gray-300">
                          {station.name}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
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
            
            {/* Price information */}
            {couponCode && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Coupon:</span>
                <div className="flex items-center">
                  <Ticket className="h-3 w-3 mr-1 text-cuephoria-lightpurple" />
                  <span>{couponCode}</span>
                </div>
              </div>
            )}
            
            {discountPercentage && discountPercentage > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Original Price:</span>
                  <span className="line-through">₹{displayOriginalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cuephoria-lightpurple">
                  <span>Discount:</span>
                  <span>{discountPercentage}% off</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between font-medium">
              <span className="text-gray-400">Final Price:</span>
              <span className="text-cuephoria-lightpurple">₹{displayFinalPrice.toFixed(2)}</span>
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
                <span className="break-all">{customerInfo.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Email actions */}
      {customerInfo.email && (
        <Button 
          className="w-full" 
          onClick={sendConfirmationEmail}
          disabled={sendingEmail}
          variant={emailSent && !emailError ? "outline" : "default"}
        >
          {sendingEmail ? 'Sending...' : emailSent && !emailError ? 'Resend Confirmation Email' : 'Send Confirmation Email'}
        </Button>
      )}
      
      {/* Share button */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Button variant="outline" onClick={shareBooking}>
          <Share2 className="mr-2 h-4 w-4" /> Share Booking
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
