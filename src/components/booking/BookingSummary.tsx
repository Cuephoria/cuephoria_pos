
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Station } from '@/types/pos.types';
import { CalendarIcon, Clock, User, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BookingSummaryProps {
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
  couponCode?: string;
  onCouponApply?: (code: string) => void;
}

const BookingSummary = ({
  stations,
  date,
  timeSlot,
  duration,
  customerInfo,
  couponCode,
  onCouponApply
}: BookingSummaryProps) => {
  const [enteredCoupon, setEnteredCoupon] = useState(couponCode || '');
  const [validCoupon, setValidCoupon] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [showCouponHint, setShowCouponHint] = useState(false);
  
  // If timeSlot is null, show a placeholder message
  if (!timeSlot) {
    return (
      <div className="p-4 text-center text-gray-400">
        Please select a time slot to see the booking summary.
      </div>
    );
  }
  
  // Group stations by type for better presentation
  const groupedStations = stations.reduce((groups, station) => {
    if (!groups[station.type]) {
      groups[station.type] = [];
    }
    groups[station.type].push(station);
    return groups;
  }, {} as Record<string, Station[]>);
  
  const totalPrice = stations.reduce((sum, station) => 
    sum + (station.hourlyRate * (duration / 60)), 0
  );
  
  const discountedPrice = validCoupon ? totalPrice * (1 - (discountPercentage/100)) : totalPrice;
  
  // Validate coupon whenever enteredCoupon changes
  useEffect(() => {
    // Handle empty coupon
    if (!enteredCoupon) {
      setValidCoupon(false);
      setDiscountPercentage(0);
      return;
    }
    
    // Simple validation for the "cuephoria50" coupon code
    if (enteredCoupon.toLowerCase() === 'cuephoria50') {
      setValidCoupon(true);
      setDiscountPercentage(50); // 50% discount
      if (onCouponApply) {
        onCouponApply(enteredCoupon);
      }
    } else {
      setValidCoupon(false);
      setDiscountPercentage(0);
    }
  }, [enteredCoupon, onCouponApply]);
  
  // When valid coupon detected, send it to parent component
  useEffect(() => {
    if (validCoupon && onCouponApply) {
      onCouponApply(enteredCoupon);
    }
  }, [validCoupon, enteredCoupon, onCouponApply]);

  const handleApplyCoupon = () => {
    // This will trigger the useEffect above to validate the coupon
    if (onCouponApply) {
      onCouponApply(enteredCoupon);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 text-white">Booking Summary</h3>
        
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-3 border-b border-gray-700">
            <div className="flex items-center mb-2 md:mb-0">
              <User className="text-cuephoria-purple mr-3 h-5 w-5" />
              <h4 className="text-gray-400">Customer</h4>
            </div>
            <div className="text-white">
              <p className="font-medium">{customerInfo.name}</p>
              <p className="text-sm text-gray-400">{customerInfo.phone}</p>
              {customerInfo.email && <p className="text-sm text-gray-400">{customerInfo.email}</p>}
            </div>
          </div>
          
          {/* Date & Time */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-3 border-b border-gray-700">
            <div className="flex items-center mb-2 md:mb-0">
              <CalendarIcon className="text-cuephoria-purple mr-3 h-5 w-5" />
              <h4 className="text-gray-400">Date & Time</h4>
            </div>
            <div className="text-white">
              <p className="font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-400">
                {timeSlot.startTime} - {timeSlot.endTime} ({duration} minutes)
              </p>
            </div>
          </div>
          
          {/* Station(s) - Grouped by type */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start py-3 border-b border-gray-700">
            <div className="flex items-center mb-2 md:mb-0">
              <Clock className="text-cuephoria-purple mr-3 h-5 w-5" />
              <h4 className="text-gray-400">Station{stations.length > 1 ? 's' : ''}</h4>
            </div>
            <div className="text-white w-full md:w-auto md:text-right">
              {Object.entries(groupedStations).map(([type, typeStations]) => (
                <div key={type} className="mb-3 last:mb-0">
                  <p className="font-medium text-cuephoria-lightpurple">
                    {type === 'ps5' ? 'PlayStation 5' : '8-Ball Pool'} 
                    <span className="text-sm ml-1">({typeStations.length})</span>
                  </p>
                  {typeStations.map(station => (
                    <p key={station.id} className="text-sm text-gray-400">
                      {station.name}: ₹{(station.hourlyRate * (duration / 60)).toFixed(2)}
                    </p>
                  ))}
                </div>
              ))}
              <p className="text-sm mt-2 pt-2 border-t border-gray-700">
                {stations.length} station{stations.length > 1 ? 's' : ''} × {duration} minutes
              </p>
            </div>
          </div>
          
          {/* Coupon Code */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-3 border-b border-gray-700">
            <div className="flex items-center mb-2 md:mb-0">
              <Ticket className="text-cuephoria-purple mr-3 h-5 w-5" />
              <h4 className="text-gray-400">Coupon</h4>
            </div>
            <div className="flex flex-col items-end space-y-2 w-full md:w-auto">
              <div className="flex w-full md:w-auto gap-2">
                <Input
                  placeholder="Enter coupon code"
                  className="bg-gray-700/50 border-gray-600 text-white w-full md:w-48"
                  value={enteredCoupon}
                  onChange={(e) => setEnteredCoupon(e.target.value)}
                  onFocus={() => setShowCouponHint(true)}
                />
                <Button 
                  size="sm" 
                  variant={validCoupon ? "default" : "outline"}
                  onClick={handleApplyCoupon}
                  className={validCoupon ? "bg-cuephoria-purple hover:bg-cuephoria-purple/90" : ""}
                >
                  Apply
                </Button>
              </div>
              
              {showCouponHint && !validCoupon && (
                <p className="text-xs text-gray-400 italic">
                  Psst... try "cuephoria50" for a special discount
                </p>
              )}
              
              {validCoupon && (
                <p className="text-sm text-cuephoria-lightpurple">
                  {discountPercentage}% discount applied!
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          {validCoupon ? (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-gray-400">
                <h4 className="text-sm">Original Price</h4>
                <p className="text-sm line-through">₹{totalPrice.toFixed(2)}</p>
              </div>
              
              <div className="flex justify-between items-center text-cuephoria-lightpurple">
                <h4 className="text-sm">Discount ({discountPercentage}%)</h4>
                <p className="text-sm">- ₹{(totalPrice - discountedPrice).toFixed(2)}</p>
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <h4 className="text-lg font-medium text-gray-300">Total Amount</h4>
                <p className="text-xl font-bold text-cuephoria-lightpurple">₹{discountedPrice.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-300">Total Amount</h4>
              <p className="text-xl font-bold text-cuephoria-lightpurple">₹{totalPrice.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-400">
          By confirming this booking, you agree to our <span className="text-cuephoria-lightpurple">terms and conditions</span>. 
          Cancellations made less than 2 hours before the booking time may be subject to a cancellation fee.
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;
