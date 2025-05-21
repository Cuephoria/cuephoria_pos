
import React, { useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { getEarliestBookingTime } from '@/utils/booking';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  loading: boolean;
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
  isToday: boolean;
  selectedDate: Date;
}

// Memoized time slot button component to prevent unnecessary re-renders
const TimeSlotButton = React.memo(({ 
  slot, 
  isSelected, 
  onSelect 
}: { 
  slot: TimeSlot; 
  isSelected: boolean; 
  onSelect: () => void;
}) => (
  <button
    disabled={!slot.isAvailable}
    onClick={onSelect}
    className={`
      p-2 rounded-md text-center text-sm transition-colors
      ${
        isSelected
          ? 'bg-cuephoria-purple text-white'
          : slot.isAvailable
          ? 'bg-gray-800 hover:bg-gray-700 text-white'
          : 'bg-gray-900/50 text-gray-500 cursor-not-allowed'
      }
    `}
  >
    {slot.startTime}
  </button>
));

// Main TimeSlotGrid component
const TimeSlotGrid = ({
  timeSlots,
  selectedTimeSlot,
  loading,
  onSelectTimeSlot,
  isToday,
  selectedDate
}: TimeSlotGridProps) => {
  // Memoize grouping logic to prevent unnecessary recalculations
  const groupedTimeSlots = useMemo(() => {
    const groups: { [hour: string]: TimeSlot[] } = {};
    
    timeSlots.forEach(slot => {
      const hour = slot.startTime.split(':')[0];
      if (!groups[hour]) {
        groups[hour] = [];
      }
      groups[hour].push(slot);
    });
    
    return groups;
  }, [timeSlots]);
  
  // Memoize statistics to prevent unnecessary recalculations
  const { availableSlots, formattedDate } = useMemo(() => {
    return {
      availableSlots: timeSlots.filter(slot => slot.isAvailable),
      formattedDate: format(selectedDate, 'EEEE, MMMM d, yyyy')
    };
  }, [timeSlots, selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 border border-gray-800 rounded-md bg-gray-900/50">
        <LoadingSpinner />
        <span className="ml-2">Loading available time slots...</span>
      </div>
    );
  }
  
  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-800 rounded-md bg-gray-900/50">
        <h3 className="text-lg font-medium">No Time Slots Available</h3>
        <p className="text-gray-400 mt-2">
          {isToday ? 
            `No more slots available for today after ${getEarliestBookingTime()}. Please select a different date.` : 
            'Please select a different date or station'
          }
        </p>
      </div>
    );
  }
  
  // If we have slots but none are available, show this message
  if (timeSlots.length > 0 && availableSlots.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-800 rounded-md bg-gray-900/50">
        <h3 className="text-lg font-medium">All Slots Are Booked</h3>
        <p className="text-gray-400 mt-2">
          All stations are fully booked for this date. Please select a different date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-cuephoria-purple/10 border border-cuephoria-purple/30 rounded">
        <p className="text-sm">
          <span className="font-medium text-cuephoria-lightpurple">Selected Date:</span>{' '}
          {formattedDate}
        </p>
        <p className="text-sm text-gray-300 mt-1">
          <span className="font-medium text-cuephoria-lightpurple">Available Slots:</span>{' '}
          {availableSlots.length} of {timeSlots.length} total
        </p>
        {isToday && (
          <p className="text-sm text-gray-300 mt-1">
            <span className="font-medium text-cuephoria-lightpurple">Note:</span> For today, bookings are available starting from {getEarliestBookingTime()} onwards (30-minute buffer from current time).
          </p>
        )}
      </div>
    
      {Object.entries(groupedTimeSlots).map(([hour, slots]) => (
        <div key={hour} className="border-b border-gray-800 pb-4 last:border-0">
          <h4 className="text-sm font-medium text-gray-400 mb-2">
            {hour}:00 {parseInt(hour) >= 12 ? 'PM' : 'AM'}
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot, index) => (
              <TimeSlotButton
                key={index}
                slot={slot}
                isSelected={
                  selectedTimeSlot?.startTime === slot.startTime && 
                  selectedTimeSlot?.endTime === slot.endTime
                }
                onSelect={() => slot.isAvailable && onSelectTimeSlot(slot)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(TimeSlotGrid);
