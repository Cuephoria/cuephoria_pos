import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Phone, Search, Share2, User } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getBookingStatusInfo, isBookingInPast } from '@/utils/booking.utils';

const CheckBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessCode = searchParams.get('code');
  
  const [viewMode, setViewMode] = useState<'search' | 'results'>('search');
  const [searchType, setSearchType] = useState<'code' | 'phone'>('code');
  const [searchValue, setSearchValue] = useState(accessCode || '');
  const [booking, setBooking] = useState<any>(null);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    document.title = "Check Your Booking | Cuephoria";
    
    if (accessCode) {
      handleSearch();
    }
  }, [accessCode]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a valid search term');
      return;
    }

    setLoading(true);

    try {
      if (searchType === 'code') {
        await searchByCode();
      } else {
        await searchByPhone();
      }
    } catch (error) {
      console.error('Error searching booking:', error);
      toast.error('Failed to find booking');
    } finally {
      setLoading(false);
    }
  };

  const searchByCode = async () => {
    // Search by access code - retrieve single booking
    const { data, error } = await supabase
      .from('booking_views')
      .select(`
        booking_id,
        access_code,
        bookings (
          id,
          booking_date,
          start_time,
          end_time,
          duration,
          status,
          station_id,
          customer_id,
          stations (
            id,
            name,
            type
          ),
          customers (
            id,
            name,
            phone,
            email
          )
        )
      `)
      .eq('access_code', searchValue.trim().toUpperCase())
      .single();

    if (error) {
      toast.error('No booking found with this code');
      return;
    }

    if (data && data.bookings) {
      // Create a new booking object with all data from bookings plus the access code
      const bookingData = {
        ...data.bookings,
        access_code: data.access_code // Store access code separately
      };
      
      setBooking(bookingData);
      setCustomerBookings([bookingData]);
      setViewMode('results');
      
      // Update last accessed timestamp
      await supabase
        .from('booking_views')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('booking_id', bookingData.id);

      // Update status for completed bookings if needed
      await checkAndUpdateBookingStatus(bookingData);
    } else {
      toast.error('Booking data incomplete or missing');
    }
  };

  const searchByPhone = async () => {
    // Search by phone number - retrieve all bookings for this customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', searchValue.trim())
      .single();
      
    if (customerError) {
      toast.error('No customer found with this phone number');
      return;
    }

    // Get all bookings for this customer
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        start_time,
        end_time,
        duration,
        status,
        station_id,
        customer_id,
        stations (
          id,
          name,
          type
        ),
        customers (
          id,
          name,
          phone,
          email
        )
      `)
      .eq('customer_id', customerData.id)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (bookingsError) {
      toast.error('Error retrieving bookings');
      return;
    }

    if (bookingsData && bookingsData.length > 0) {
      // Get access codes for all retrieved bookings
      const bookingIds = bookingsData.map(booking => booking.id);
      const { data: viewData } = await supabase
        .from('booking_views')
        .select('booking_id, access_code')
        .in('booking_id', bookingIds);
        
      // Add access codes to the booking objects
      const bookingsWithCodes = bookingsData.map(booking => {
        const view = viewData?.find(v => v.booking_id === booking.id);
        return {
          ...booking,
          access_code: view?.access_code || 'N/A'
        };
      });

      // Set the newest booking as the main booking
      setBooking(bookingsWithCodes[0]);
      setCustomerBookings(bookingsWithCodes);
      setViewMode('results');
      
      // Update statuses for all bookings
      await Promise.all(bookingsWithCodes.map(booking => checkAndUpdateBookingStatus(booking)));
    } else {
      toast.error('No bookings found for this phone number');
    }
  };

  const checkAndUpdateBookingStatus = async (booking: any) => {
    // Skip if already completed, cancelled, or no-show
    if (['completed', 'cancelled', 'no-show'].includes(booking.status)) {
      return;
    }

    // Convert booking date and end time to a single datetime for comparison
    const bookingDate = new Date(booking.booking_date);
    const [endHours, endMinutes] = booking.end_time.split(':').map(Number);
    bookingDate.setHours(endHours, endMinutes, 0);

    const now = new Date();
    
    // Check if booking end time has passed
    if (now > bookingDate) {
      try {
        // Update to completed if booking has ended
        await supabase
          .from('bookings')
          .update({ 
            status: 'completed',
            status_updated_at: new Date().toISOString(),
            status_updated_by: 'system'
          })
          .eq('id', booking.id);
          
        // Update the local state
        if (booking.id === booking?.id) {
          setBooking({...booking, status: 'completed'});
        }
        
        // Update in the customer bookings array
        setCustomerBookings(prevBookings => 
          prevBookings.map(b => 
            b.id === booking.id ? {...b, status: 'completed'} : b
          )
        );
      } catch (error) {
        console.error('Error updating booking status automatically:', error);
      }
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;
    
    setUpdatingStatus(true);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          status_updated_at: new Date().toISOString(),
          status_updated_by: 'customer'
        })
        .eq('id', booking.id);
        
      if (error) throw error;
      
      // Update local state
      setBooking({
        ...booking,
        status: newStatus
      });
      
      // Update in the customer bookings array
      setCustomerBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === booking.id ? {...b, status: newStatus} : b
        )
      );
      
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShareBooking = async () => {
    if (!booking) return;

    try {
      const bookingDetails = {
        customerName: booking.customers.name,
        stationName: booking.stations.name,
        stationType: booking.stations.type,
        date: format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy'),
        time: `${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}`,
        duration: `${booking.duration} minutes`,
        status: booking.status,
        viewUrl: `${window.location.origin}/bookings/check?code=${booking.access_code}`
      };

      // Use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Cuephoria Booking Details',
          text: `My booking at Cuephoria for ${bookingDetails.stationName} on ${bookingDetails.date} at ${bookingDetails.time}`,
          url: bookingDetails.viewUrl
        });
        toast.success('Booking details shared successfully!');
      } else {
        // Fallback to copying to clipboard
        const text = `
Cuephoria Booking Details
          
Station: ${bookingDetails.stationName} (${bookingDetails.stationType.toUpperCase()})
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Duration: ${bookingDetails.duration}
Status: ${booking.status}
          
View online: ${bookingDetails.viewUrl}
        `;
        
        navigator.clipboard.writeText(text);
        toast.success('Booking details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing booking:', error);
      toast.error('Failed to share booking details');
    }
  };

  const handleSelectBooking = (selectedBooking: any) => {
    setBooking(selectedBooking);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = getBookingStatusInfo(status);
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const filteredBookings = () => {
    if (activeTab === 'all') {
      return customerBookings;
    } else if (activeTab === 'upcoming') {
      return customerBookings.filter(b => 
        !isBookingInPast(b) && ['confirmed', 'in-progress'].includes(b.status)
      );
    } else if (activeTab === 'past') {
      return customerBookings.filter(b => 
        isBookingInPast(b) || ['completed', 'cancelled', 'no-show'].includes(b.status)
      );
    }
    return customerBookings;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue mb-2">
            Check Your Booking
          </h1>
          <p className="text-gray-400">
            {viewMode === 'search' 
              ? 'Enter your booking code or phone number to view your booking details'
              : 'Your booking details are displayed below'
            }
          </p>
        </div>

        {viewMode === 'search' ? (
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-center">Find Your Booking</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search by</Label>
                <Select 
                  value={searchType} 
                  onValueChange={(value) => setSearchType(value as 'code' | 'phone')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code">Booking Code</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>
                  {searchType === 'code' ? 'Enter your booking code' : 'Enter your phone number'}
                </Label>
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'code' ? 'e.g. ABCD1234' : 'e.g. 1234567890'}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={handleSearch} 
                className="w-full bg-cuephoria-purple hover:bg-cuephoria-purple/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2" /> Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Search Booking
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : booking ? (
          <>
            {searchType === 'phone' && customerBookings.length > 1 && (
              <Card className="bg-gray-900/80 border-gray-800 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={activeTab} className="space-y-2">
                      {filteredBookings().length > 0 ? (
                        filteredBookings().map((b) => (
                          <div 
                            key={b.id}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              booking.id === b.id 
                                ? 'bg-cuephoria-purple/20 border border-cuephoria-purple/50' 
                                : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800'
                            }`}
                            onClick={() => handleSelectBooking(b)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">
                                  {format(new Date(b.booking_date), 'MMM d')} · {b.start_time.substring(0, 5)}
                                </p>
                                <p className="text-xs text-gray-400">{b.stations.name}</p>
                              </div>
                              {getStatusBadge(b.status)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-2">No bookings found</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          
            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Booking Details</CardTitle>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4">
                <div className="p-4 rounded-md bg-gray-800/50 border border-gray-700/50 space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                    <span className="text-gray-400">Date:</span>
                    <span className="ml-auto font-medium">
                      {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                    <span className="text-gray-400">Time:</span>
                    <span className="ml-auto font-medium">
                      {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                    <span className="text-gray-400">Station:</span>
                    <span className="ml-auto font-medium">
                      {booking.stations.name} ({booking.stations.type.toUpperCase()})
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <User className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                    <span className="text-gray-400">Customer:</span>
                    <span className="ml-auto font-medium">
                      {booking.customers.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                    <span className="text-gray-400">Contact:</span>
                    <span className="ml-auto font-medium">
                      {booking.customers.phone}
                    </span>
                  </div>
                </div>

                {booking.access_code && (
                  <div className="p-4 rounded-md bg-cuephoria-purple/10 border border-cuephoria-purple/30 text-center">
                    <div className="text-sm text-gray-400 mb-1">Booking Code</div>
                    <div className="text-xl font-mono font-bold text-cuephoria-lightpurple tracking-wide">
                      {booking.access_code}
                    </div>
                  </div>
                )}

                {booking.status === 'confirmed' && !isBookingInPast(booking) && (
                  <div className="p-4 rounded-md bg-gray-800/50 border border-gray-700/50">
                    <h3 className="font-medium text-white mb-2">Need to change your booking?</h3>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="destructive" 
                        onClick={() => handleStatusUpdate('cancelled')}
                        disabled={updatingStatus}
                        className="bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30"
                      >
                        {updatingStatus ? <LoadingSpinner className="mr-2" /> : null}
                        Cancel this booking
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Please cancel at least 1 hour before your booking time to allow others to book.
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3">
                <Button 
                  onClick={handleShareBooking}
                  className="w-full bg-cuephoria-purple/20 text-cuephoria-purple hover:bg-cuephoria-purple/30 border border-cuephoria-purple/50"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share Booking Details
                </Button>
                
                <Button 
                  onClick={() => setViewMode('search')}
                  variant="outline"
                  className="w-full"
                >
                  Search Another Booking
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <Card className="bg-gray-900/80 border-gray-800">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-gray-300">Booking not found</p>
              <Button
                onClick={() => setViewMode('search')}
                variant="link"
                className="mt-4 text-cuephoria-purple"
              >
                Try searching again
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-8 text-center">
          <Button 
            onClick={() => navigate('/')}
            variant="link"
            className="text-gray-400 hover:text-white"
          >
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate('/booknow')}
            variant="link"
            className="text-cuephoria-purple"
          >
            Make a New Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckBooking;
