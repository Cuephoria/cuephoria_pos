
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gamepad2, Clock, Book, User, Table2, Star, ChevronRight, CheckCircle, Trophy } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import LiveSessionsSection from '@/components/dashboard/LiveSessionsSection';
import { useTodayBookings } from '@/hooks/booking/useTodayBookings';

const Index = () => {
  const navigate = useNavigate();
  const { todayBookings, loading, fetchTodayBookings } = useTodayBookings();

  useEffect(() => {
    document.title = "Cuephoria Gaming";
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Hero Section with Action Cards */}
      <div className="bg-gradient-to-br from-gray-900 to-black py-16 px-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-radial from-cuephoria-purple/20 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
              alt="Cuephoria Logo" 
              className="h-20 md:h-24" 
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue">
            Cuephoria
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Premium Gaming and Billiards Experience
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
            <Card className="bg-cuephoria-purple/20 border-cuephoria-purple/40 backdrop-blur-sm hover:shadow-[0_5px_15px_rgba(155,135,245,0.3)] transition-all duration-300 group">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-cuephoria-purple/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Book className="h-6 w-6 text-cuephoria-lightpurple" />
                </div>
                <CardTitle className="text-white text-xl">Book Now</CardTitle>
                <CardDescription className="text-gray-300">
                  Reserve your gaming session or billiards table
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-300">
                Choose from PS5 stations or professional billiards tables at your preferred time.
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => navigate('/booknow')} 
                  className="w-full bg-cuephoria-purple hover:bg-cuephoria-purple/80"
                >
                  Make a Reservation <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-cuephoria-blue/20 border-cuephoria-blue/40 backdrop-blur-sm hover:shadow-[0_5px_15px_rgba(14,165,233,0.3)] transition-all duration-300 group">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-cuephoria-blue/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-blue-300" />
                </div>
                <CardTitle className="text-white text-xl">Check Booking</CardTitle>
                <CardDescription className="text-gray-300">
                  View or manage your existing reservation
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-300">
                Enter your booking reference to check details or make changes to your reservation.
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => navigate('/bookings/check')} 
                  className="w-full bg-cuephoria-blue hover:bg-cuephoria-blue/80"
                >
                  View Your Booking <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Today's Bookings & Active Sessions Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue">
            Live Status Dashboard
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            View today's schedule and monitor current active sessions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Bookings Section */}
          <Card className="bg-gray-900/90 border-gray-800 overflow-hidden shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2 text-cuephoria-purple" />
                  Today's Schedule
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchTodayBookings} className="text-gray-400 hover:text-white">
                  Refresh
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner className="mr-2" />
                  <span className="text-gray-400">Loading schedule...</span>
                </div>
              ) : todayBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Time</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayBookings.slice(0, 5).map(booking => (
                        <TableRow key={booking.id} className={isUpcoming(booking.start_time) ? 'bg-cuephoria-purple/10' : ''}>
                          <TableCell className="font-medium">
                            {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {booking.stations.type === 'ps5' ? (
                                <Gamepad2 className="h-4 w-4 mr-1 text-cuephoria-lightpurple" />
                              ) : (
                                <Table2 className="h-4 w-4 mr-1 text-cuephoria-lightpurple" />
                              )}
                              <span>{booking.stations.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
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
                  <p className="text-sm mt-1">Be the first to reserve your spot!</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 pb-4 px-6 bg-gray-800/50">
              <Button 
                onClick={() => navigate('/booknow')} 
                variant="default" 
                className="w-full bg-cuephoria-purple hover:bg-cuephoria-purple/90"
              >
                Book Your Session Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Live Active Sessions */}
          <LiveSessionsSection />
        </div>
        
        {/* Features Section (kept from original) */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue">
              Premium Gaming Experience
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our state-of-the-art gaming facility offers the latest PS5 consoles and premium billiards tables
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gray-800/80 border-gray-700 transform transition-all hover:scale-105">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-cuephoria-purple/20 flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-cuephoria-lightpurple" />
                </div>
                <CardTitle className="text-xl text-white">Modern Gaming</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest PlayStation 5 consoles with 4K displays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Latest games library</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Pro gaming accessories</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Comfortable gaming stations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 transform transition-all hover:scale-105">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-cuephoria-purple/20 flex items-center justify-center mb-4">
                  <Table2 className="h-6 w-6 text-cuephoria-lightpurple" />
                </div>
                <CardTitle className="text-xl text-white">Premium Billiards</CardTitle>
                <CardDescription className="text-gray-400">
                  Professional-grade billiards tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Competition-quality tables</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Professional equipment</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Perfect for both beginners and pros</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 transform transition-all hover:scale-105">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-cuephoria-purple/20 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-cuephoria-lightpurple" />
                </div>
                <CardTitle className="text-xl text-white">Tournaments</CardTitle>
                <CardDescription className="text-gray-400">
                  Regular gaming tournaments and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Weekly competitions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Cash prizes</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Community events</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-blue/20 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Cuephoria?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Book your gaming session or billiards table now and enjoy our premium facilities
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate('/booknow')} size="lg" className="bg-cuephoria-purple hover:bg-cuephoria-purple/90 text-white px-8">
              Book Now
            </Button>
            <Button onClick={() => navigate('/contact')} size="lg" variant="outline" className="text-white border-white/25 hover:bg-white/10">
              Contact Us
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <img 
            src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
            alt="Cuephoria Logo" 
            className="h-10 mx-auto mb-4" 
          />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Cuephoria. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => navigate('/terms')}>
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => navigate('/privacy')}>
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
