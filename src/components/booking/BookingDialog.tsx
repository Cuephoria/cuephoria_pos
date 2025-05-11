
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, User, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types/pos.types';
import { generateTimeSlots, getFormattedDate } from '@/utils/pos.utils';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
}

interface Station {
  id: string;
  name: string;
  type: string;
  hourly_rate: number;
  is_occupied: boolean;
  consolidated_name?: string;
  parent_station_id?: string;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  station: Station | null;
}

const BookingDialog: React.FC<BookingDialogProps> = ({ 
  open, 
  onOpenChange,
  onSuccess,
  station 
}) => {
  const [customerType, setCustomerType] = useState<'existing' | 'new'>('existing');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [timeSlots, setTimeSlots] = useState<{ time: string, available: boolean }[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.phone.includes(searchTerm)
  );
  
  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // Fetch available time slots when date or station changes
  useEffect(() => {
    if (date && station) {
      fetchAvailableTimeSlots();
    }
  }, [date, station]);
  
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone')
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive'
      });
    }
  };
  
  const fetchAvailableTimeSlots = async () => {
    if (!date || !station) return;
    
    try {
      // First, generate all possible time slots
      const slots = generateTimeSlots(60); // 60 minute increments
      setTimeSlots(slots);
      
      // Then check availability
      const formattedDate = format(date, 'yyyy-MM-dd');
      const stationId = station.id;
      
      // For actual implementation, we'd use the get_available_slots function:
      /*
      const { data, error } = await supabase
        .rpc('get_available_slots', { 
          p_date: formattedDate, 
          p_station_id: stationId,
          p_slot_duration: parseInt(duration)
        });
      */
      
      // For demo purposes, we'll use a simple availability check
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('booking_date', formattedDate)
        .eq('station_id', stationId)
        .eq('status', 'confirmed');
        
      if (error) throw error;
      
      // Mark slots as available/unavailable
      const bookedSlots = data || [];
      const available = slots.filter(slot => {
        // Check if this slot overlaps with any booking
        return !bookedSlots.some(booking => {
          const bookingStart = booking.start_time;
          const bookingEnd = booking.end_time;
          // Simple overlap check
          return (slot.time >= bookingStart && slot.time < bookingEnd);
        });
      });
      
      setAvailableTimeSlots(available.map(slot => slot.time));
      
      // If the previously selected time is no longer available, reset it
      if (time && !available.find(slot => slot.time === time)) {
        setTime('');
      }
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available time slots',
        variant: 'destructive'
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!station || !date || !time) {
      toast({
        title: 'Error',
        description: 'Please select station, date, and time',
        variant: 'destructive'
      });
      return;
    }
    
    if (customerType === 'existing' && !selectedCustomer) {
      toast({
        title: 'Error',
        description: 'Please select a customer',
        variant: 'destructive'
      });
      return;
    }
    
    if (customerType === 'new' && (!customerName || !customerPhone)) {
      toast({
        title: 'Error',
        description: 'Please enter customer name and phone',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let customerId = selectedCustomer;
      
      // If new customer, create first
      if (customerType === 'new') {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null,
          })
          .select('id')
          .single();
        
        if (customerError) throw customerError;
        
        if (newCustomer) {
          customerId = newCustomer.id;
        } else {
          throw new Error('Failed to create customer');
        }
      }
      
      // Calculate end time based on start time and duration
      const startTime = time;
      const durationMinutes = parseInt(duration);
      const [hours, minutes] = startTime.split(':').map(Number);
      
      const endTimeDate = new Date();
      endTimeDate.setHours(hours);
      endTimeDate.setMinutes(minutes + durationMinutes);
      
      const endTime = `${endTimeDate.getHours().toString().padStart(2, '0')}:${endTimeDate.getMinutes().toString().padStart(2, '0')}`;
      
      // Create booking
      const bookingData = {
        station_id: station.id,
        customer_id: customerId,
        booking_date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        duration: durationMinutes,
        status: 'confirmed'
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Booking created successfully'
      });
      
      // Close dialog and refresh
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a Slot</DialogTitle>
          <DialogDescription>
            Reserve a gaming session for {station?.name || 'this station'}.
          </DialogDescription>
        </DialogHeader>
        
        {/* Step 1: Customer Selection */}
        <Tabs defaultValue="existing" value={customerType} onValueChange={(value) => setCustomerType(value as 'existing' | 'new')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Existing Customer
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              New Customer
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Customer</Label>
              <Input
                placeholder="Search by name or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <ScrollArea className="h-[120px] rounded-md border p-2">
                {filteredCustomers.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className={cn(
                          "flex flex-col p-2 rounded-md cursor-pointer hover:bg-accent",
                          selectedCustomer === customer.id ? "bg-accent" : ""
                        )}
                        onClick={() => setSelectedCustomer(customer.id)}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.phone} {customer.email ? `• ${customer.email}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No customers found
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="new" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name*</Label>
              <Input 
                id="name"
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="Enter customer name" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number*</Label>
              <Input 
                id="phone"
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                placeholder="Enter phone number" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input 
                id="email"
                value={customerEmail} 
                onChange={(e) => setCustomerEmail(e.target.value)} 
                placeholder="Enter email address" 
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Step 2: Date, Time and Duration */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Booking...' : 'Book Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
