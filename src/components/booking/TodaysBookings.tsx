
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistance } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
  station: {
    name: string;
    type: string;
  };
}

interface GroupedBookings {
  [timeSlot: string]: {
    [customerId: string]: {
      customerName: string;
      bookings: Booking[];
    };
  };
}

const TodaysBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodaysBookings = async () => {
      try {
        setLoading(true);
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            start_time,
            end_time,
            status,
            customer:customer_id (name, phone),
            station:station_id (name, type)
          `)
          .eq('booking_date', today)
          .order('start_time');
        
        if (error) throw error;
        
        setBookings(data as unknown as Booking[]);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load today\'s bookings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTodaysBookings();
    
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchTodaysBookings, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Group bookings by time slot and then by customer
  const groupBookings = (bookings: Booking[]): GroupedBookings => {
    return bookings.reduce((grouped, booking) => {
      const timeSlot = `${booking.start_time} - ${booking.end_time}`;
      const customerId = booking.customer?.name || 'Unknown';
      
      if (!grouped[timeSlot]) {
        grouped[timeSlot] = {};
      }
      
      if (!grouped[timeSlot][customerId]) {
        grouped[timeSlot][customerId] = {
          customerName: booking.customer?.name || 'Unknown',
          bookings: []
        };
      }
      
      grouped[timeSlot][customerId].bookings.push(booking);
      
      return grouped;
    }, {} as GroupedBookings);
  };
  
  const groupedBookings = groupBookings(bookings);
  const timeSlots = Object.keys(groupedBookings).sort();
  
  // Status badge styles
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'no-show':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner />
        <span className="ml-2">Loading today's bookings...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-400 p-4 text-center">
        {error}
      </div>
    );
  }
  
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-800 rounded-md bg-gray-900/50">
        <h3 className="text-lg font-medium">No Bookings Today</h3>
        <p className="text-gray-400 mt-2">
          There are no bookings scheduled for today.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium flex items-center">
          <Clock className="h-5 w-5 mr-2 text-cuephoria-lightpurple" />
          Today's Bookings 
          <span className="ml-2 bg-cuephoria-purple/20 text-white text-sm px-2 py-0.5 rounded-full">
            {bookings.length}
          </span>
        </h3>
      </div>
      
      <ScrollArea className="h-[500px] border border-gray-800 rounded-md">
        <div className="divide-y divide-gray-800">
          {timeSlots.map(timeSlot => (
            <div key={timeSlot} className="p-4">
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                <h4 className="text-md font-medium">{timeSlot}</h4>
                <span className="ml-2 text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                  {Object.values(groupedBookings[timeSlot]).reduce(
                    (count, { bookings }) => count + bookings.length, 0
                  )} bookings
                </span>
              </div>
              
              <div className="ml-6 space-y-4">
                {Object.entries(groupedBookings[timeSlot]).map(([customerId, { customerName, bookings }]) => (
                  <div key={customerId} className="border-l-2 border-gray-800 pl-4">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                      <h5 className="font-medium">{customerName}</h5>
                      <span className="ml-2 text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                        {bookings.length} stations
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                      {bookings.map(booking => (
                        <div key={booking.id} className="bg-gray-800/30 p-3 rounded-md">
                          <div className="font-medium">{booking.station.name}</div>
                          <div className="text-sm text-gray-400">
                            {booking.station.type === 'ps5' ? 'PlayStation 5' : 'Pool Table'}
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {booking.id.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TodaysBookings;
