
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gamepad2, Clock, Book, User, Table2, Star, ChevronRight, CheckCircle, Trophy, Sparkles, Zap, Heart, Users, Award } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import LiveSessionsSection from '@/components/dashboard/LiveSessionsSection';
import { useTodayBookings } from '@/hooks/booking/useTodayBookings';
import UpcomingTournaments from '@/components/dashboard/UpcomingTournaments';
import { motion } from 'framer-motion';

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

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Hero Section with Action Cards */}
      <div className="bg-gradient-to-br from-gray-900 to-black py-16 px-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-radial from-cuephoria-purple/30 to-transparent"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-20 -left-20 w-40 h-40 rounded-full bg-cuephoria-purple/20 blur-3xl animate-float-shadow"></div>
        <div className="absolute bottom-20 -right-20 w-40 h-40 rounded-full bg-cuephoria-blue/20 blur-3xl animate-float delay-300"></div>
        
        <motion.div 
          className="max-w-4xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 flex justify-center">
            <motion.img 
              src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
              alt="Cuephoria Logo" 
              className="h-24 md:h-28"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            />
          </div>
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-4 font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Cuephoria
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-4 text-gray-300 max-w-2xl mx-auto"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Premium Gaming and Billiards Experience
          </motion.p>
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((index) => (
                <Star key={index} className="h-5 w-5 text-yellow-400" fill="#FACC15" />
              ))}
            </div>
          </motion.div>
          
          {/* Quick Action Buttons */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button 
              onClick={() => navigate('/booknow')} 
              size="lg"
              className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90 text-white shadow-lg shadow-purple-900/20 group"
            >
              Book Now <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              onClick={() => navigate('/bookings/check')} 
              size="lg" 
              variant="outline" 
              className="border-white/20 hover:bg-white/10 text-white shadow-lg"
            >
              Check Booking Status
            </Button>
          </motion.div>
          
          {/* Main Action Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 max-w-6xl mx-auto"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} whileHover={{ y: -5 }} transition={{ type: "spring" }}>
              <Card className="bg-gradient-to-br from-cuephoria-purple/20 to-cuephoria-lightpurple/10 border-cuephoria-purple/40 backdrop-blur-sm hover:shadow-[0_5px_25px_rgba(155,135,245,0.3)] transition-all duration-300 group overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-cuephoria-purple/20 blur-2xl"></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-cuephoria-purple/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Gamepad2 className="h-7 w-7 text-cuephoria-lightpurple" />
                  </div>
                  <CardTitle className="text-white text-2xl">Gaming Sessions</CardTitle>
                  <CardDescription className="text-gray-300">
                    Premium PS5 gaming stations with the latest titles
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300 relative z-10">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Latest PS5 consoles with 4K displays</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Extensive game library</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    onClick={() => navigate('/booknow')} 
                    className="w-full bg-cuephoria-purple hover:bg-cuephoria-purple/80 group"
                    variant="default"
                  >
                    Book Gaming Session <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            <motion.div variants={item} whileHover={{ y: -5 }} transition={{ type: "spring" }}>
              <Card className="bg-gradient-to-br from-cuephoria-blue/20 to-cuephoria-blue/5 border-cuephoria-blue/40 backdrop-blur-sm hover:shadow-[0_5px_25px_rgba(14,165,233,0.3)] transition-all duration-300 group overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-cuephoria-blue/20 blur-2xl"></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-cuephoria-blue/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Table2 className="h-7 w-7 text-blue-300" />
                  </div>
                  <CardTitle className="text-white text-2xl">Pool Tables</CardTitle>
                  <CardDescription className="text-gray-300">
                    Professional billiards tables for casual play and competition
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300 relative z-10">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Competition-grade tables</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Professional equipment</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    onClick={() => navigate('/booknow')} 
                    className="w-full bg-cuephoria-blue hover:bg-cuephoria-blue/80 group"
                    variant="default"
                  >
                    Book Pool Table <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            <motion.div variants={item} whileHover={{ y: -5 }} transition={{ type: "spring" }}>
              <Card className="bg-gradient-to-br from-cuephoria-orange/20 to-cuephoria-orange/5 border-cuephoria-orange/40 backdrop-blur-sm hover:shadow-[0_5px_25px_rgba(249,115,22,0.3)] transition-all duration-300 group overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-cuephoria-orange/20 blur-2xl"></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-cuephoria-orange/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Trophy className="h-7 w-7 text-orange-300" />
                  </div>
                  <CardTitle className="text-white text-2xl">Tournaments</CardTitle>
                  <CardDescription className="text-gray-300">
                    Regular gaming events and pool competitions
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300 relative z-10">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Weekly tournaments</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Great prizes and competition</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    onClick={() => navigate('/tournaments')} 
                    className="w-full bg-cuephoria-orange hover:bg-cuephoria-orange/80 group"
                    variant="default"
                  >
                    View Tournaments <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Today's Bookings & Active Sessions Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue">
            Live Status & Upcoming Events
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Check out our current facility status and upcoming tournaments
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Bookings Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 overflow-hidden shadow-xl hover:shadow-purple-900/20 transition-all duration-500">
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-cuephoria-purple" />
                    Today's Schedule
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchTodayBookings} 
                  className="text-gray-400 hover:text-white"
                >
                  Refresh
                </Button>
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
                        {todayBookings.slice(0, 5).map((booking, index) => (
                          <motion.tr
                            key={booking.id} 
                            className={`${isUpcoming(booking.start_time) ? 'bg-cuephoria-purple/10' : ''} ${index % 2 === 0 ? 'bg-black/20' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                            whileHover={{ backgroundColor: 'rgba(155, 135, 245, 0.05)' }}
                          >
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
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-black/20 px-4">
                    <Calendar className="h-12 w-12 mx-auto opacity-30 mb-3" />
                    <p>No bookings scheduled for today</p>
                    <p className="text-sm mt-1 mb-4">Be the first to reserve your spot!</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/booknow')} 
                      className="border-gray-700 hover:bg-gray-800 text-gray-300"
                    >
                      Create a Booking
                    </Button>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-2 pb-4 px-6 bg-gradient-to-r from-gray-800/80 to-gray-800/50">
                <Button 
                  onClick={() => navigate('/booknow')} 
                  variant="default" 
                  className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue hover:opacity-90 group"
                >
                  Book Your Session Now <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          {/* Upcoming Tournaments Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <UpcomingTournaments />
          </motion.div>
        </div>
        
        {/* Live Sessions Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <LiveSessionsSection publicView={true} />
        </motion.div>
        
        {/* Features Section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue">
              Premium Gaming Experience
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our state-of-the-art gaming facility offers the latest PS5 consoles and premium billiards tables
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 border-gray-700/50 transform transition-all overflow-hidden">
                <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-cuephoria-purple/20 blur-xl"></div>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-cuephoria-purple/20 flex items-center justify-center mb-4">
                    <Gamepad2 className="h-6 w-6 text-cuephoria-lightpurple" />
                  </div>
                  <CardTitle className="text-xl text-white">Modern Gaming</CardTitle>
                  <CardDescription className="text-gray-400">
                    Latest PlayStation 5 consoles
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
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 border-gray-700/50 transform transition-all overflow-hidden">
                <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-cuephoria-blue/20 blur-xl"></div>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-cuephoria-blue/20 flex items-center justify-center mb-4">
                    <Table2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Premium Billiards</CardTitle>
                  <CardDescription className="text-gray-400">
                    Professional tables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Competition-quality</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Professional equipment</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 border-gray-700/50 transform transition-all overflow-hidden">
                <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-cuephoria-orange/20 blur-xl"></div>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-cuephoria-orange/20 flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-cuephoria-orange" />
                  </div>
                  <CardTitle className="text-xl text-white">Tournaments</CardTitle>
                  <CardDescription className="text-gray-400">
                    Regular events and prizes
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
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 border-gray-700/50 transform transition-all overflow-hidden">
                <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-green-500/20 blur-xl"></div>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Membership</CardTitle>
                  <CardDescription className="text-gray-400">
                    Exclusive perks for regulars
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Discounted rates</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Priority booking</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Membership & Promotions Banner */}
        <motion.div 
          className="mb-16 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cuephoria-purple/20 via-cuephoria-blue/20 to-cuephoria-purple/20"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-cuephoria-blue/20 blur-3xl"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-cuephoria-purple/20 blur-3xl"></div>
            
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Become a Member</h3>
                  <p className="text-gray-300 max-w-md">
                    Join our membership program and enjoy exclusive discounts, priority bookings, and special event access.
                  </p>
                </div>
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => navigate('/membership')}
                    className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg px-6"
                    size="lg"
                  >
                    <Award className="mr-2 h-5 w-5" /> View Membership Plans
                  </Button>
                  <Button
                    onClick={() => navigate('/contact')}
                    variant="outline"
                    className="border-white/30 hover:bg-white/10"
                  >
                    Contact for Group Bookings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-blue/20 py-16 px-6">
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="h-8 w-8 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Cuephoria?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Book your gaming session or billiards table now and enjoy our premium facilities
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => navigate('/booknow')} 
              size="lg" 
              className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue hover:opacity-90 text-white px-8 shadow-lg shadow-cuephoria-purple/30"
            >
              Book Now <Zap className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={() => navigate('/contact')} 
              size="lg" 
              variant="outline" 
              className="text-white border-white/25 hover:bg-white/10"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-400 text-center py-12 px-4 border-t border-gray-800">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img 
            src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
            alt="Cuephoria Logo" 
            className="h-10 mx-auto mb-6" 
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-left max-w-4xl mx-auto">
            <div>
              <h4 className="font-medium text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/')}>Home</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/booknow')}>Book Now</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/public/stations')}>Stations</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Information</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/about')}>About Us</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/membership')}>Membership</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/tournaments')}>Tournaments</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/contact')}>Contact Us</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/faq')}>FAQs</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/help')}>Help Center</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/terms')}>Terms</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/privacy')}>Privacy</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => navigate('/cookies')}>Cookies</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-800 pt-8">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Cuephoria. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-full p-2 h-auto w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-full p-2 h-auto w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                <span className="sr-only">YouTube</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-full p-2 h-auto w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-full p-2 h-auto w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span className="sr-only">Instagram</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
};

export default Index;
