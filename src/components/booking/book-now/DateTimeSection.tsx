
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import TimeSlotGrid from '@/components/booking/TimeSlotGrid';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DateTimeSectionProps {
  selectedDate: Date;
  selectedTimeSlot: TimeSlot | null;
  timeSlots: TimeSlot[];
  bookingDuration: number;
  isToday: boolean;
  loadingTimeSlots: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onDurationChange: (duration: string) => void;
  onTimeSlotSelect: (slot: TimeSlot) => void;
}

const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  selectedDate,
  selectedTimeSlot,
  timeSlots,
  bookingDuration,
  isToday,
  loadingTimeSlots,
  onDateSelect,
  onDurationChange,
  onTimeSlotSelect
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Picker - Now as a direct calendar */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
            Select Date
          </h3>
          <div className={`border border-gray-800 rounded-md bg-gray-800/50 p-2 ${isMobile ? 'overflow-x-auto' : ''}`}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              initialFocus
              className="mx-auto pointer-events-auto"
              classNames={{
                day_selected: "bg-cuephoria-purple text-white hover:bg-cuephoria-purple hover:text-white",
                day_today: "bg-gray-700 text-white",
                day: "text-sm p-0 h-8 w-8 aria-selected:opacity-100"
              }}
            />
          </div>
        </div>
        
        {/* Duration & Time Slots */}
        <div className="space-y-6">
          {/* Duration Selector */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
              Select Duration
            </h3>
            <RadioGroup 
              defaultValue={bookingDuration.toString()}
              className="grid grid-cols-2 gap-4"
              onValueChange={onDurationChange}
            >
              <div>
                <RadioGroupItem 
                  value="60" 
                  id="r1" 
                  className="peer sr-only" 
                />
                <Label
                  htmlFor="r1"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-gray-100 peer-data-[state=checked]:border-cuephoria-purple peer-data-[state=checked]:bg-cuephoria-purple/10 cursor-pointer"
                >
                  <span className="text-lg font-semibold mb-1">1 Hour</span>
                  <span className="text-sm text-gray-400">60 minutes</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="120"
                  id="r2"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="r2"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-gray-100 peer-data-[state=checked]:border-cuephoria-purple peer-data-[state=checked]:bg-cuephoria-purple/10 cursor-pointer"
                >
                  <span className="text-lg font-semibold mb-1">2 Hours</span>
                  <span className="text-sm text-gray-400">120 minutes</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="180"
                  id="r3"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="r3"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-gray-100 peer-data-[state=checked]:border-cuephoria-purple peer-data-[state=checked]:bg-cuephoria-purple/10 cursor-pointer"
                >
                  <span className="text-lg font-semibold mb-1">3 Hours</span>
                  <span className="text-sm text-gray-400">180 minutes</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="240"
                  id="r4"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="r4"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-800/50 p-4 hover:bg-gray-800 hover:text-gray-100 peer-data-[state=checked]:border-cuephoria-purple peer-data-[state=checked]:bg-cuephoria-purple/10 cursor-pointer"
                >
                  <span className="text-lg font-semibold mb-1">4 Hours</span>
                  <span className="text-sm text-gray-400">240 minutes</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
      
      {/* Time Slots */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
          Select Time Slot
        </h3>
        
        <TimeSlotGrid 
          timeSlots={timeSlots}
          selectedTimeSlot={selectedTimeSlot}
          loading={loadingTimeSlots}
          onSelectTimeSlot={onTimeSlotSelect}
          isToday={isToday}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default DateTimeSection;
