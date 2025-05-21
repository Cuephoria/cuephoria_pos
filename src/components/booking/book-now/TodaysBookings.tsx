
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, User } from 'lucide-react';
import { getBookingStatusInfo } from '@/utils/booking';

interface TodaysBookingsProps {
  todayBookings: any[];
  bookingTimeSlots: string[];
  groupedBookings: Record<string, any[]>;
  loading: boolean;
}

const TodaysBookings: React.FC<TodaysBookingsProps> = ({
  todayBookings,
  bookingTimeSlots,
  groupedBookings,
  loading
}) => {
  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusInfo = getBookingStatusInfo(status);
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <Card className="mb-8 bg-gray-900/80 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-cuephoria-purple" />
            Today's Bookings
          </div>
          <Badge variant="outline" className="ml-2 bg-gray-800 text-gray-300">
            {todayBookings.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <LoadingSpinner className="mr-2" />
            <span className="text-gray-400">Loading today's bookings...</span>
          </div>
        ) : todayBookings.length > 0 ? (
          <ScrollArea className="h-[250px] rounded-md border border-gray-800">
            <div className="p-2">
              {bookingTimeSlots.map(timeSlot => (
                <div key={timeSlot} className="mb-3 last:mb-0">
                  <div className="flex items-center mb-1 bg-gray-800/50 p-1 rounded">
                    <Clock className="h-4 w-4 text-cuephoria-purple mr-2" />
                    <span className="text-sm font-medium text-gray-200">{timeSlot}</span>
                  </div>
                  <div className="pl-6 border-l border-gray-800">
                    {groupedBookings[timeSlot].map(booking => (
                      <div 
                        key={booking.id} 
                        className="mb-2 last:mb-0 bg-gray-900/40 p-2 rounded border border-gray-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className="h-3 w-3 text-cuephoria-lightpurple mr-1" />
                            <span className="text-xs text-gray-300">{booking.customers.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">{booking.stations.name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="text-gray-400">
                            {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                          </span>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No bookings scheduled for today
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysBookings;
