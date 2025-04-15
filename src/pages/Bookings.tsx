
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendlyEvent, fetchScheduledEvents, getTodaysEvents } from '@/services/calendlyService';
import BookingCard from '@/components/bookings/BookingCard';
import CalendlyEmbed from '@/components/bookings/CalendlyEmbed';
import { 
  Calendar, 
  ListFilter, 
  CalendarPlus, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';

const Bookings = () => {
  const [bookings, setBookings] = useState<CalendlyEvent[]>([]);
  const [todayBookings, setTodayBookings] = useState<CalendlyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // You would replace this with your Calendly URL
  const calendlyURL = `https://calendly.com/${user?.username || 'cuephoria'}`;
  
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const events = await fetchScheduledEvents();
      setBookings(events);
      
      // Get today's events separately
      const todayEvents = await getTodaysEvents();
      setTodayBookings(todayEvents);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  const handleBookingCancelled = () => {
    // Refresh the bookings list after cancellation
    fetchBookings();
  };
  
  return (
    <div className="flex-1 space-y-6 p-6 bg-[#1A1F2C] text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-heading">Bookings</h2>
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-700 hover:bg-gray-800"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
      {/* Stats section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={bookings.filter(b => b.status === 'active').length}
          icon={Calendar}
          description="Active scheduled appointments"
        />
        <StatCard
          title="Today's Bookings"
          value={todayBookings.filter(b => b.status === 'active').length}
          icon={Calendar}
          description="Appointments scheduled for today"
          color="text-green-500"
        />
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Upcoming
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1">
            <CalendarPlus className="h-4 w-4" /> Schedule New
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cuephoria-lightpurple" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {bookings.map((booking) => (
                <BookingCard 
                  key={booking.uri} 
                  booking={booking}
                  onCancel={handleBookingCancelled}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-xl font-medium">No bookings found</p>
              <p className="mt-2">Schedule your first booking by clicking on "Schedule New"</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="schedule">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <CalendlyEmbed url={calendlyURL} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bookings;
