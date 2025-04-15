
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { CalendlyEvent, getUpcomingEvents } from '@/services/calendlyService';
import { format } from 'date-fns';

const UpcomingBookingsCard = () => {
  const [bookings, setBookings] = useState<CalendlyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const events = await getUpcomingEvents(3);
        setBookings(events);
      } catch (error) {
        console.error("Failed to fetch upcoming bookings:", error);
        setError("Could not load upcoming bookings");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  const formatBookingTime = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Time not available";
    }
  };
  
  if (error) {
    return (
      <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Upcoming Bookings</CardTitle>
            <p className="text-sm text-gray-400">Next scheduled appointments</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#9b87f5]/20 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-[#9b87f5]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <AlertTriangle className="h-12 w-12 mb-2 text-red-400" />
            <p>{error}</p>
            <Button 
              variant="outline"
              className="mt-3 border-gray-700 hover:bg-gray-800 hover:text-white"
              onClick={() => navigate('/bookings')}
            >
              Manage Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-white font-heading">Upcoming Bookings</CardTitle>
          <p className="text-sm text-gray-400">Next scheduled appointments</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-[#9b87f5]/20 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-[#9b87f5]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-cuephoria-lightpurple border-t-transparent rounded-full"></div>
          </div>
        ) : bookings.length > 0 ? (
          <>
            {bookings.map((booking, index) => (
              <div key={booking.uri || index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700">
                <div>
                  <p className="font-medium text-white">{booking.name}</p>
                  <div className="flex items-center text-gray-400 text-xs mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{format(new Date(booking.startTime), 'EEE, MMM d')} • </span>
                    <span className="ml-1">{formatBookingTime(booking.startTime, booking.endTime)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-2 border-gray-700 hover:bg-gray-800 hover:text-white"
              onClick={() => navigate('/bookings')}
            >
              View All Bookings <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <Calendar className="h-12 w-12 mb-2 opacity-50" />
            <p>No upcoming bookings</p>
            <Button 
              variant="outline"
              className="mt-3 border-gray-700 hover:bg-gray-800 hover:text-white"
              onClick={() => navigate('/bookings')}
            >
              Schedule a Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBookingsCard;
