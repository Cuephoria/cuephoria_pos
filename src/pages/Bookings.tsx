
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { usePOS } from '@/context/POSContext';
import { Calendar as CalendarIcon, Search, Filter, Clock, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Bookings = () => {
  const { bookings, stations, customers, cancelBooking } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Apply filters
  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const searchMatch = 
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    const dateMatch = filterDate 
      ? booking.bookingDate === format(filterDate, 'yyyy-MM-dd')
      : true;
    
    // Status filter
    const statusMatch = filterStatus === 'all' || booking.status === filterStatus;
    
    // Type filter (PS5 or 8-Ball)
    const station = stations.find(s => s.id === booking.stationId);
    const typeMatch = filterType === 'all' || station?.type === filterType;
    
    return searchMatch && dateMatch && statusMatch && typeMatch;
  });

  // Handle booking cancellation
  const handleCancel = async (bookingId: string) => {
    const success = await cancelBooking(bookingId);
    if (success) {
      toast.success('Booking canceled successfully');
    } else {
      toast.error('Failed to cancel booking');
    }
  };

  // Group bookings by date for the summary section
  const bookingsByDate = bookings.reduce((acc, booking) => {
    if (!acc[booking.bookingDate]) {
      acc[booking.bookingDate] = [];
    }
    acc[booking.bookingDate].push(booking);
    return acc;
  }, {} as Record<string, typeof bookings>);

  // Statistics for today
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.bookingDate === today);
  const todayConfirmed = todayBookings.filter(b => b.status === 'confirmed').length;
  
  // Format time for display (convert 24h to 12h format)
  const formatTime = (timeString: string) => {
    try {
      const date = parseISO(`2000-01-01T${timeString}`);
      return format(date, 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight gradient-text font-heading">Bookings</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-lightpurple/10 border-cuephoria-purple/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-cuephoria-lightpurple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-900/20 to-green-700/10 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <p className="text-xs text-green-500 mt-1">{todayConfirmed} confirmed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-900/20 to-blue-700/10 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">PS5 Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => {
                const station = stations.find(s => s.id === b.stationId);
                return station?.type === 'ps5';
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-amber-900/20 to-amber-700/10 border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">8-Ball Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => {
                const station = stations.find(s => s.id === b.stationId);
                return station?.type === '8ball';
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>Filter and search through all bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search bookings..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Station Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ps5">PlayStation 5</SelectItem>
                <SelectItem value="8ball">8-Ball Pool</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableCaption>A list of all bookings</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const station = stations.find(s => s.id === booking.stationId);
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">
                        {booking.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {station?.name}
                          <Badge className={`ml-2 ${
                            station?.type === 'ps5' 
                              ? 'bg-cuephoria-purple' 
                              : 'bg-green-600'
                          }`}>
                            {station?.type === 'ps5' ? 'PS5' : '8-Ball'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{format(parseISO(booking.bookingDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </TableCell>
                      <TableCell>{booking.duration} min</TableCell>
                      <TableCell>
                        <Badge className={
                          booking.status === 'confirmed' ? 'bg-green-600' :
                          booking.status === 'canceled' ? 'bg-red-600' :
                          'bg-blue-600'
                        }>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === 'confirmed' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">Cancel</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this booking? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleCancel(booking.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {booking.status === 'canceled' && (
                          <span className="text-sm text-gray-400">Canceled</span>
                        )}
                        {booking.status === 'completed' && (
                          <span className="text-sm text-gray-400">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-400">No bookings found</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {searchTerm || filterDate || filterStatus !== 'all' || filterType !== 'all' 
                          ? 'Try adjusting your filters'
                          : 'Create a new booking from the stations page'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;
