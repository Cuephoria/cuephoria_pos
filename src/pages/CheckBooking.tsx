
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

const CheckBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessCode = searchParams.get('code');
  
  const [viewMode, setViewMode] = useState<'search' | 'results'>('search');
  const [searchType, setSearchType] = useState<'code' | 'phone'>('code');
  const [searchValue, setSearchValue] = useState(accessCode || '');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      let bookingData;
      
      if (searchType === 'code') {
        // Search by access code
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

        if (error) throw error;

        if (data && data.bookings) {
          bookingData = data.bookings;
          // Update last accessed timestamp
          await supabase
            .from('booking_views')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('booking_id', bookingData.id);
        }
      } else {
        // Search by phone number
        const { data, error } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', searchValue.trim())
          .single();
          
        if (error) {
          toast.error('No customer found with this phone number');
          setLoading(false);
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
          .eq('customer_id', data.id)
          .order('booking_date', { ascending: false })
          .order('start_time', { ascending: false })
          .limit(1);

        if (bookingsError) throw bookingsError;

        if (bookingsData && bookingsData.length > 0) {
          bookingData = bookingsData[0];
          
          // Get access code for this booking
          const { data: viewData } = await supabase
            .from('booking_views')
            .select('access_code')
            .eq('booking_id', bookingData.id)
            .single();
            
          if (viewData) {
            bookingData.access_code = viewData.access_code;
          }
        } else {
          toast.error('No bookings found for this phone number');
          setLoading(false);
          return;
        }
      }

      if (bookingData) {
        setBooking(bookingData);
        setViewMode('results');
      } else {
        toast.error('Booking not found');
      }
    } catch (error) {
      console.error('Error searching booking:', error);
      toast.error('Failed to find booking');
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'confirmed': { color: 'bg-green-500/20 text-green-500 border-green-500/50', label: 'Confirmed' },
      'in-progress': { color: 'bg-blue-500/20 text-blue-500 border-blue-500/50', label: 'In Progress' },
      'completed': { color: 'bg-purple-500/20 text-purple-500 border-purple-500/50', label: 'Completed' },
      'cancelled': { color: 'bg-red-500/20 text-red-500 border-red-500/50', label: 'Cancelled' },
      'no-show': { color: 'bg-orange-500/20 text-orange-500 border-orange-500/50', label: 'No Show' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-500/20 text-gray-500 border-gray-500/50', label: status };
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
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

              {booking.status === 'confirmed' && (
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
