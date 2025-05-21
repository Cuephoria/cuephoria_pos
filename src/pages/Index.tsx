
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Calendar, Clock, Info, Users, Table2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Index = () => {
  const navigate = useNavigate();
  const [todayBookings, setTodayBookings] = React.useState<any[]>([]);
  const [activeStations, setActiveStations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    document.title = "Cuephoria Gaming";
    fetchTodayData();
    
    const intervalId = setInterval(fetchTodayData, 60000); // Refresh every minute
    return () => clearInterval(intervalId);
  }, []);

  const fetchTodayData = async () => {
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      // Fetch today's bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id, 
          booking_date, 
          start_time, 
          end_time, 
          status,
          stations (name, type),
          customers (name, phone)
        `)
        .eq('booking_date', today)
        .order('start_time');
        
      if (bookingsError) throw bookingsError;
      
      // Fetch active stations
      const { data: stationsData, error: stationsError } = await supabase
        .from('stations')
        .select(`
          id, 
          name,
          type,
          is_occupied,
          sessions (
            id,
            start_time,
            end_time,
            customers (name)
          )
        `)
        .eq('is_occupied', true);
        
      if (stationsError) throw stationsError;
      
      // Process stations data to include active session info
      const processedStations = stationsData.map(station => {
        const activeSession = station.sessions.find(session => session.end_time === null);
        return {
          ...station,
          activeSession: activeSession || null
        };
      });
      
      setTodayBookings(bookingsData || []);
      setActiveStations(processedStations || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load today\'s data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'completed':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'no-show':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  // Function to check if a booking is upcoming (within next hour)
  const isUpcoming = (startTimeStr) => {
    const now = new Date();
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0);
    
    const diffMs = startTime.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes > 0 && diffMinutes <= 60;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: "url('/lovable-uploads/b266b413-e798-48db-83a6-bdfd46a3bb6e.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }} 
        className="bg-gradient-to-br from-gray-900/80 to-black/80 text-white py-16 px-6 flex flex-col justify-center items-center text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue">
            Cuephoria
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-white font-light">
            The Ultimate Gaming Experience
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate('/login')} size="lg" variant="outline" className="text-white border-cuephoria-purple hover:bg-cuephoria-purple/20">
              Staff Login
            </Button>
            <Button onClick={() => navigate('/booknow')} size="lg" className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90">
              Book Now
            </Button>
            <Button onClick={() => navigate('/bookings/check')} size="lg" variant="outline" className="text-white border-cuephoria-purple hover:bg-cuephoria-purple/20">
              Check Booking
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-8">
          {/* Today's Bookings Section */}
          <Card className="bg-gray-900/80 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-cuephoria-purple mr-2" />
                  <h2 className="text-xl font-semibold text-white">Today's Bookings</h2>
                </div>
                <Button 
                  onClick={fetchTodayData} 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                >
                  Refresh
                </Button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-400">Loading bookings...</span>
                </div>
              ) : todayBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayBookings.map(booking => (
                        <TableRow key={booking.id} className={isUpcoming(booking.start_time) ? 'bg-cuephoria-purple/10' : ''}>
                          <TableCell>
                            <div className="font-medium text-white">
                              {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                            </div>
                            {isUpcoming(booking.start_time) && (
                              <span className="text-xs text-cuephoria-lightpurple">Upcoming</span>
                            )}
                          </TableCell>
                          <TableCell>{booking.stations.name}</TableCell>
                          <TableCell>
                            {booking.stations.type === 'ps5' ? (
                              <span className="flex items-center">
                                <Gamepad2 className="h-4 w-4 mr-1" />
                                PS5
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Table2 className="h-4 w-4 mr-1" />
                                Pool
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{booking.customers.name}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(booking.status)}`}>
                              {booking.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto opacity-30 mb-3" />
                  <p>No bookings for today</p>
                  <Button 
                    onClick={() => navigate('/booknow')} 
                    variant="link" 
                    className="text-cuephoria-purple mt-2"
                  >
                    Make a booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Currently Active Stations */}
          <Card className="bg-gray-900/80 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <Gamepad2 className="h-6 w-6 text-cuephoria-purple mr-2" />
                <h2 className="text-xl font-semibold text-white">Active Gaming Stations</h2>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-400">Loading stations...</span>
                </div>
              ) : activeStations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeStations.map(station => (
                    <Card key={station.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {station.type === 'ps5' ? (
                              <Gamepad2 className="h-5 w-5 text-cuephoria-lightpurple mr-2" />
                            ) : (
                              <Table2 className="h-5 w-5 text-cuephoria-lightpurple mr-2" />
                            )}
                            <span className="font-medium text-white">{station.name}</span>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-500 border border-blue-500/50">
                            Active
                          </Badge>
                        </div>
                        
                        {station.activeSession && (
                          <div className="text-sm text-gray-400 mt-2">
                            <div className="flex items-center mb-1">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{station.activeSession.customers?.name || 'Customer'}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                Started at {new Date(station.activeSession.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Gamepad2 className="h-12 w-12 mx-auto opacity-30 mb-3" />
                  <p>No stations currently active</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900/50 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-800/80 border-gray-700">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-cuephoria-purple/20 flex items-center justify-center mb-4">
                <Gamepad2 className="h-6 w-6 text-cuephoria-lightpurple" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Modern Gaming</h3>
              <p className="text-gray-400">Experience gaming on the latest PlayStation 5 consoles with a wide selection of popular games.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/80 border-gray-700">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-cuephoria-purple/20 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-cuephoria-lightpurple" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Easy Booking</h3>
              <p className="text-gray-400">Reserve your gaming session or pool table in advance with our simple online booking system.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/80 border-gray-700">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-cuephoria-purple/20 flex items-center justify-center mb-4">
                <Table2 className="h-6 w-6 text-cuephoria-lightpurple" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Experience</h3>
              <p className="text-gray-400">Enjoy a comfortable environment with premium gaming setups and professional pool tables.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Cuephoria. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Contact Us
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Privacy
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
