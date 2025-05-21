
import React from 'react';
import { format } from 'date-fns';
import { Station } from '@/types/pos.types';
import { CalendarIcon, Clock, User } from 'lucide-react';

interface BookingSummaryProps {
  stations: Station[];
  date: Date;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  duration: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
}

const BookingSummary = ({
  stations,
  date,
  timeSlot,
  duration,
  customerInfo
}: BookingSummaryProps) => {
  const totalPrice = stations.reduce((sum, station) => 
    sum + (station.hourlyRate * (duration / 60)), 0
  );
  
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
          
          {/* Station(s) */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start py-3 border-b border-gray-700">
            <div className="flex items-center mb-2 md:mb-0">
              <Clock className="text-cuephoria-purple mr-3 h-5 w-5" />
              <h4 className="text-gray-400">Station{stations.length > 1 ? 's' : ''}</h4>
            </div>
            <div className="text-white">
              {stations.map((station, index) => (
                <div key={station.id} className="mb-2 last:mb-0">
                  <p className="font-medium">{station.name}</p>
                  <p className="text-sm text-gray-400">
                    ₹{station.hourlyRate} per hour × {duration / 60} hour{duration > 60 ? 's' : ''} = 
                    ₹{(station.hourlyRate * (duration / 60)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-300">Total Amount</h4>
            <p className="text-xl font-bold text-cuephoria-lightpurple">₹{totalPrice.toFixed(2)}</p>
          </div>
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
