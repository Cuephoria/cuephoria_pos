
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isBefore, isToday } from 'date-fns';
import { CalendarIcon, Clock, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/context/AuthContext';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Booking type definition
interface Booking {
  id: string;
  station_id: string;
  customer_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes: string | null;
  created_at: string;
  station: {
    name: string;
    type: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string | null;
  };
}

// Customer with bookings type
interface CustomerWithBookings {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  bookings: Booking[];
}

// Date with customers type
interface DateWithCustomers {
  date: string;
  formattedDate: string;
  customers: CustomerWithBookings[];
}

// Filter options
type FilterOption = 'all' | 'today' | 'upcoming' | 'past' | 'cancelled';
type StatusOption = 'all' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
type StationType = 'all' | 'ps5' | '8ball';

const BookingsPage = () => {
  // Get auth context
  const { user } = useAuth();
  
  // States for bookings and filters
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>('all');
  const [selectedType, setSelectedType] = useState<StationType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  
  // States for editing and deleting bookings
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedStatus, setEditedStatus] = useState<Booking['status']>('confirmed');
  const [editedNotes, setEditedNotes] = useState('');
  
  // State for tracking the latest booking ID we've seen
  const [latestBookingId, setLatestBookingId] = useState<string | null>(null);
  
  // Fetch bookings with relevant join tables
  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          station:station_id (name, type),
          customer:customer_id (name, phone, email)
        `)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Booking[];
    }
  });

  // Check for new bookings and notify admin
  useEffect(() => {
    if (!bookings || bookings.length === 0 || !user || user.username !== 'admin') return;
    
    // Find the most recent booking
    const sortedBookings = [...bookings].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const mostRecentBooking = sortedBookings[0];
    
    // If we have a previous latest booking and the current most recent booking is different
    if (latestBookingId && mostRecentBooking.id !== latestBookingId) {
      // Show notification
      toast.success(`New booking received from ${mostRecentBooking.customer.name}`, {
        description: `Date: ${mostRecentBooking.booking_date}, Time: ${mostRecentBooking.start_time}`,
        duration: 5000,
      });
    }
    
    // Update the latest booking ID we've seen
    setLatestBookingId(mostRecentBooking.id);
  }, [bookings, user, latestBookingId]);

  // Subscribe to realtime updates for the bookings table
  useEffect(() => {
    if (!user || user.username !== 'admin') return;
    
    const channel = supabase
      .channel('bookings-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'bookings' 
        }, 
        (payload) => {
          console.log('New booking received:', payload);
          // Refetch bookings when a new booking is created
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, user]);

  // Group bookings by date and then by customer
  const dateGroupedBookings = React.useMemo(() => {
    if (!bookings) return [];
    
    // Apply filters first
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = parseISO(booking.booking_date);
      const isUpcoming = isBefore(new Date(), bookingDate) || 
                        (isToday(bookingDate) && booking.start_time > format(new Date(), 'HH:mm'));
      const isPast = !isUpcoming && booking.status !== 'cancelled';
      
      // Apply time-based filters
      if (selectedFilter === 'today' && !isToday(bookingDate)) return false;
      if (selectedFilter === 'upcoming' && !isUpcoming) return false;
      if (selectedFilter === 'past' && !isPast) return false;
      if (selectedFilter === 'cancelled' && booking.status !== 'cancelled') return false;
      
      // Apply status filter
      if (selectedStatus !== 'all' && booking.status !== selectedStatus) return false;
      
      // Apply station type filter
      if (selectedType !== 'all' && booking.station.type !== selectedType) return false;
      
      // Apply date filter
      if (dateFilter && format(dateFilter, 'yyyy-MM-dd') !== booking.booking_date) return false;
      
      // Apply search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          booking.station.name.toLowerCase().includes(search) ||
          booking.customer.name.toLowerCase().includes(search) ||
          booking.customer.phone.includes(search) ||
          (booking.customer.email && booking.customer.email.toLowerCase().includes(search)) ||
          booking.id.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
    
    // Group by date first
    const dateMap = new Map<string, Map<string, CustomerWithBookings>>();
    
    filteredBookings.forEach(booking => {
      // Add the date if it doesn't exist
      if (!dateMap.has(booking.booking_date)) {
        dateMap.set(booking.booking_date, new Map<string, CustomerWithBookings>());
      }
      
      const customersForDate = dateMap.get(booking.booking_date)!;
      
      // Add the customer if they don't exist for this date
      if (!customersForDate.has(booking.customer_id)) {
        customersForDate.set(booking.customer_id, {
          id: booking.customer_id,
          name: booking.customer.name,
          phone: booking.customer.phone,
          email: booking.customer.email,
          bookings: []
        });
      }
      
      // Add the booking to the customer's bookings array
      customersForDate.get(booking.customer_id)!.bookings.push(booking);
    });
    
    // Convert to array of dates with customers
    const result: DateWithCustomers[] = [];
    
    dateMap.forEach((customersMap, date) => {
      const customers = Array.from(customersMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');
      
      result.push({
        date,
        formattedDate,
        customers
      });
    });
    
    // Sort by date (newest first)
    return result.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [bookings, selectedFilter, selectedStatus, selectedType, searchTerm, dateFilter]);
  
  // Toggle date expansion
  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };
  
  // Toggle customer expansion
  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };
  
  // Expand all dates
  const expandAllDates = () => {
    const allDates = dateGroupedBookings.map(date => date.date);
    setExpandedDates(new Set(allDates));
  };
  
  // Collapse all dates
  const collapseAllDates = () => {
    setExpandedDates(new Set());
  };
  
  // Statistics
  const stats = React.useMemo(() => {
    if (!bookings) return { total: 0, upcoming: 0, today: 0, ps5: 0, pool: 0 };
    
    return bookings.reduce((acc, booking) => {
      const bookingDate = parseISO(booking.booking_date);
      const isUpcoming = isBefore(new Date(), bookingDate) || 
                        (isToday(bookingDate) && booking.start_time > format(new Date(), 'HH:mm'));
      
      acc.total++;
      if (isUpcoming && booking.status === 'confirmed') acc.upcoming++;
      if (isToday(bookingDate)) acc.today++;
      if (booking.station.type === 'ps5') acc.ps5++;
      if (booking.station.type === '8ball') acc.pool++;
      
      return acc;
    }, { total: 0, upcoming: 0, today: 0, ps5: 0, pool: 0 });
  }, [bookings]);
  
  // Handle booking edit
  const handleEditBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: editedStatus,
          notes: editedNotes || null
        })
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast.success('Booking updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };
  
  // Modified to handle booking view deletion first
  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      // First, delete associated booking_views
      const { error: viewsError } = await supabase
        .from('booking_views')
        .delete()
        .eq('booking_id', selectedBooking.id);
      
      if (viewsError) {
        console.error('Error deleting booking views:', viewsError);
        toast.error('Failed to delete booking: ' + viewsError.message);
        return;
      }
      
      // After successfully deleting booking_views, delete the booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast.success('Booking deleted successfully');
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };
  
  // Open edit dialog with booking data
  const openEditDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditedStatus(booking.status);
    setEditedNotes(booking.notes || '');
    setIsEditDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedFilter('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setSearchTerm('');
    setDateFilter(undefined);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: Booking['status']) => {
    switch (status) {
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
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-400">Error loading bookings: {(error as Error).message}</p>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Bookings Management</h1>
      
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gray-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-sm">Total Bookings</span>
            <span className="text-2xl font-bold">{stats.total}</span>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-sm">Upcoming</span>
            <span className="text-2xl font-bold">{stats.upcoming}</span>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-sm">Today</span>
            <span className="text-2xl font-bold">{stats.today}</span>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-sm">PS5 Bookings</span>
            <span className="text-2xl font-bold">{stats.ps5}</span>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-sm">Pool Bookings</span>
            <span className="text-2xl font-bold">{stats.pool}</span>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Booking Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Time Period</label>
              <Select 
                value={selectedFilter} 
                onValueChange={(value) => setSelectedFilter(value as FilterOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past Bookings</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Status</label>
              <Select 
                value={selectedStatus} 
                onValueChange={(value) => setSelectedStatus(value as StatusOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Station Type</label>
              <Select 
                value={selectedType} 
                onValueChange={(value) => setSelectedType(value as StationType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Station type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ps5">PS5</SelectItem>
                  <SelectItem value="8ball">Pool Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Date</label>
              <DatePicker
                date={dateFilter}
                onDateChange={setDateFilter}
                placeholder="Pick a date"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Bookings by Date and Customer */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Bookings by Date
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAllDates}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAllDates}>
                Collapse All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : dateGroupedBookings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">No bookings found matching the current filters</p>
              {(selectedFilter !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || searchTerm || dateFilter) && (
                <Button variant="link" onClick={resetFilters}>Clear filters</Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {dateGroupedBookings.map((dateGroup) => (
                <Collapsible 
                  key={dateGroup.date} 
                  open={expandedDates.has(dateGroup.date)} 
                  onOpenChange={() => toggleDate(dateGroup.date)}
                  className="border border-gray-800 rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-800/50">
                      <div>
                        <h3 className="font-medium">{dateGroup.formattedDate}</h3>
                        <div className="text-sm text-gray-400">
                          {dateGroup.customers.length} customer{dateGroup.customers.length !== 1 ? 's' : ''}, 
                          {dateGroup.customers.reduce((total, customer) => total + customer.bookings.length, 0)} booking{dateGroup.customers.reduce((total, customer) => total + customer.bookings.length, 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {expandedDates.has(dateGroup.date) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 space-y-4">
                      {dateGroup.customers.map((customer) => (
                        <Collapsible 
                          key={`${dateGroup.date}-${customer.id}`} 
                          open={expandedCustomers.has(customer.id)} 
                          onOpenChange={() => toggleCustomer(customer.id)}
                          className="border border-gray-700 rounded-lg overflow-hidden"
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-700/50">
                              <div>
                                <h4 className="font-medium">{customer.name}</h4>
                                <div className="text-sm text-gray-400 flex flex-col sm:flex-row sm:gap-2">
                                  <span>{customer.phone}</span>
                                  {customer.email && (
                                    <span className="hidden sm:inline text-gray-500">•</span>
                                  )}
                                  {customer.email && <span>{customer.email}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">
                                  {customer.bookings.length} booking{customer.bookings.length !== 1 ? 's' : ''}
                                </span>
                                {expandedCustomers.has(customer.id) ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Station</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {customer.bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                      <TableCell className="font-mono text-xs">
                                        {booking.id.substring(0, 8).toUpperCase()}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center">
                                          <span className={`w-2 h-2 rounded-full mr-2 ${booking.station.type === 'ps5' ? 'bg-blue-400' : 'bg-green-400'}`} />
                                          {booking.station.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {booking.station.type === 'ps5' ? 'PlayStation 5' : 'Pool Table'}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center">
                                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                          {booking.start_time} - {booking.end_time}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {booking.duration} mins
                                      </TableCell>
                                      <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(booking.status)}`}>
                                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(booking)}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDeleteDialog(booking)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Customer</label>
              <div className="font-medium">{selectedBooking?.customer.name}</div>
              <div className="text-sm">{selectedBooking?.customer.phone}</div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Booking</label>
              <div className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1 text-gray-400" />
                {selectedBooking?.booking_date && format(parseISO(selectedBooking.booking_date), 'dd MMM yyyy')}
              </div>
              <div className="flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                {selectedBooking?.start_time} - {selectedBooking?.end_time}
              </div>
              <div className="text-sm mt-1">{selectedBooking?.station.name}</div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Status</label>
              <Select value={editedStatus} onValueChange={(value) => setEditedStatus(value as Booking['status'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Notes</label>
              <Input 
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add notes about this booking"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditBooking}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBooking} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingsPage;
