
import React from 'react';
import { format } from 'date-fns';
import { Station } from '@/types/pos.types';
import { CalendarIcon, Clock, Gamepad2, Table2, User } from 'lucide-react';

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

interface BookingSummaryProps {
  station: Station;
  date: Date;
  timeSlot: TimeSlot;
  duration: number;
  customerInfo: CustomerInfo;
}

const BookingSummary = ({
  station,
  date,
  timeSlot,
  duration,
  customerInfo
}: BookingSummaryProps) => {
  // Calculate estimated cost
  const hourlyRate = station.hourlyRate;
  const hours = duration / 60;
  const estimatedCost = hourlyRate * hours;
  
  // Get icon based on station type
  const StationIcon = station.type === 'ps5' ? Gamepad2 : Table2;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Please review your booking details</h3>
      
      {/* Station Details */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700 space-y-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg ${
            station.type === 'ps5' ? 'bg-cuephoria-purple/20' : 'bg-green-900/20'
          } flex items-center justify-center mr-3`}>
            <StationIcon className={`h-5 w-5 ${
              station.type === 'ps5' ? 'text-cuephoria-lightpurple' : 'text-green-400'
            }`} />
          </div>
          <div>
            <h4 className="font-medium text-white">{station.name}</h4>
            <p className="text-sm text-gray-400">
              {station.type === 'ps5' ? 'PlayStation 5 Console' : '8-Ball Pool Table'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
            <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
            <span>{timeSlot.startTime} - {timeSlot.endTime} ({duration} minutes)</span>
          </div>
        </div>
      </div>
      
      {/* Customer Details */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
        <h4 className="font-medium text-white mb-3 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Customer Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
          <div>
            <span className="text-gray-400 text-sm">Name:</span>
            <p>{customerInfo.name}</p>
          </div>
          
          <div>
            <span className="text-gray-400 text-sm">Phone:</span>
            <p>{customerInfo.phone}</p>
          </div>
          
          {customerInfo.email && (
            <div className="col-span-2">
              <span className="text-gray-400 text-sm">Email:</span>
              <p>{customerInfo.email}</p>
            </div>
          )}
        </div>
        
        {customerInfo.isExistingCustomer && (
          <div className="mt-3 pt-2 border-t border-gray-700">
            <span className="bg-cuephoria-purple/20 text-cuephoria-lightpurple text-xs px-2 py-1 rounded-full">
              Existing Customer
            </span>
          </div>
        )}
      </div>
      
      {/* Pricing Summary */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
        <h4 className="font-medium text-white mb-3">Pricing Summary</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Hourly Rate:</span>
            <span>₹{hourlyRate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Duration:</span>
            <span>{hours} hour{hours > 1 ? 's' : ''}</span>
          </div>
          
          <div className="pt-2 border-t border-gray-700 flex justify-between font-medium">
            <span>Estimated Total:</span>
            <span className="text-cuephoria-lightpurple">₹{estimatedCost}</span>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            * Payment will be collected at the venue
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
