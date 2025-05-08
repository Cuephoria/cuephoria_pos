
import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onApplyFilter: () => void;
  onResetFilter: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateRange,
  setDateRange,
  onApplyFilter,
  onResetFilter
}) => {
  // Function to handle preset date ranges
  const handlePresetChange = (value: string) => {
    const today = new Date();
    const from = new Date();
    
    switch (value) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        setDateRange({ from, to: today });
        break;
      case 'yesterday':
        from.setDate(today.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        const yesterday = new Date(from);
        yesterday.setHours(23, 59, 59, 999);
        setDateRange({ from, to: yesterday });
        break;
      case 'last7days':
        from.setDate(today.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        setDateRange({ from, to: today });
        break;
      case 'last30days':
        from.setDate(today.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        setDateRange({ from, to: today });
        break;
      case 'thisMonth':
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        setDateRange({ from, to: today });
        break;
      case 'lastMonth':
        from.setMonth(today.getMonth() - 1);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        lastDayOfLastMonth.setHours(23, 59, 59, 999);
        setDateRange({ from, to: lastDayOfLastMonth });
        break;
      case 'custom':
        // Do nothing, let the user pick the dates manually
        break;
      default:
        setDateRange(undefined);
        break;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center bg-gray-800 p-3 rounded-lg">
      <div className="flex-1">
        <Select onValueChange={handlePresetChange} defaultValue="custom">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="default" 
          size="sm" 
          className="bg-[#9b87f5] hover:bg-[#8a73e8]"
          onClick={onApplyFilter}
        >
          Apply Filter
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onResetFilter}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default DateRangeFilter;
