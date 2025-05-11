
import React, { useState, useEffect } from 'react';
import { format, addMinutes, parse } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Station, Customer } from '@/types/pos.types';
import { usePOS } from '@/context/POSContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Form schema
const formSchema = z.object({
  customerId: z.string().optional(),
  customerType: z.enum(['existing', 'new']),
  name: z.string().min(2, 'Name is required').optional(),
  phone: z.string().min(10, 'Valid phone number is required').optional(),
  email: z.string().email('Invalid email').optional(),
  bookingDate: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string({
    required_error: "Please select a time",
  }),
  duration: z.coerce.number().min(30, 'Minimum duration is 30 minutes'),
  notes: z.string().optional(),
});

// Conditionally require name and phone if customer type is 'new'
const conditionalSchema = z.discriminatedUnion('customerType', [
  z.object({
    customerType: z.literal('new'),
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Invalid email').optional(),
    customerId: z.string().optional(),
    bookingDate: z.date(),
    startTime: z.string(),
    duration: z.number(),
    notes: z.string().optional(),
  }),
  z.object({
    customerType: z.literal('existing'),
    customerId: z.string({
      required_error: "Please select a customer",
    }),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    bookingDate: z.date(),
    startTime: z.string(),
    duration: z.number(),
    notes: z.string().optional(),
  }),
]);

type FormValues = z.infer<typeof conditionalSchema>;

interface BookingDialogProps {
  station: Station;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingDialog: React.FC<BookingDialogProps> = ({ station, open, onOpenChange }) => {
  const { customers, addCustomer, addBooking, getAvailableSlots } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ startTime: string, endTime: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(conditionalSchema),
    defaultValues: {
      customerType: 'existing',
      bookingDate: new Date(),
      duration: 60,
      notes: '',
    },
  });

  const customerType = form.watch('customerType');
  const selectedDate = form.watch('bookingDate');

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers.slice(0, 10));
    } else {
      const filtered = customers.filter(
        customer => 
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered.slice(0, 10));
    }
  }, [searchTerm, customers]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        try {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          const slots = await getAvailableSlots(station.id, formattedDate);
          // Filter only available slots
          const availableSlots = slots.filter(slot => slot.isAvailable);
          setAvailableSlots(availableSlots);
        } catch (error) {
          console.error('Error fetching available slots:', error);
          toast.error('Failed to load available time slots');
        }
      };
      fetchSlots();
    }
  }, [selectedDate, station.id, getAvailableSlots]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let customerId = data.customerId;
      
      // Create new customer if needed
      if (data.customerType === 'new' && data.name && data.phone) {
        const newCustomer = {
          name: data.name,
          phone: data.phone,
          email: data.email || '',
          isMember: false,
          loyaltyPoints: 0,
          totalSpent: 0,
          totalPlayTime: 0,
        };
        
        const createdCustomer = addCustomer(newCustomer);
        if (createdCustomer) {
          customerId = createdCustomer.id;
        }
      }

      if (!customerId) {
        toast.error('Customer selection required');
        return;
      }

      // Parse start and end times
      const startTime = data.startTime;
      const endTimeObj = addMinutes(
        parse(startTime, 'HH:mm:ss', new Date()),
        data.duration
      );
      const endTime = format(endTimeObj, 'HH:mm:ss');
      
      // Create booking
      const newBooking = {
        stationId: station.id,
        customerId,
        bookingDate: format(data.bookingDate, 'yyyy-MM-dd'),
        startTime,
        endTime,
        duration: data.duration,
        status: 'confirmed' as const,
        notes: data.notes || '',
      };
      
      const result = await addBooking(newBooking);
      
      if (result) {
        toast.success('Booking confirmed!');
        onOpenChange(false);
      } else {
        toast.error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Error creating booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {station.name}</DialogTitle>
          <DialogDescription>
            {station.type === 'ps5' ? 'Reserve a PlayStation 5 console' : 'Reserve an 8-ball pool table'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex"
                  >
                    <FormItem className="flex items-center space-x-1 space-y-0 mr-4">
                      <FormControl>
                        <RadioGroupItem value="existing" />
                      </FormControl>
                      <FormLabel className="font-normal">Existing Customer</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="new" />
                      </FormControl>
                      <FormLabel className="font-normal">New Customer</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>
              )}
            />

            {customerType === 'existing' ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <Input
                    placeholder="Search customers by name or phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          className={`p-2 cursor-pointer hover:bg-gray-700 flex justify-between ${
                            form.getValues('customerId') === customer.id ? 'bg-gray-700' : ''
                          }`}
                          onClick={() => form.setValue('customerId', customer.id)}
                        >
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-400">{customer.phone}</div>
                          </div>
                          {customer.isMember && (
                            <span className="bg-green-700 text-green-100 text-xs px-2 py-1 rounded-full h-fit">
                              Member
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-400">No customers found</div>
                    )}
                  </div>
                </div>
                
                {form.formState.errors.customerId && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.customerId.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bookingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot, index) => (
                            <SelectItem key={index} value={slot.startTime}>
                              {slot.startTime.substring(0, 5)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No available slots
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Estimated cost: ₹{(station.hourlyRate / 60 * field.value).toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Add any special requests" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || availableSlots.length === 0}
                className={station.type === 'ps5' ? 'bg-cuephoria-purple' : 'bg-green-600'}
              >
                {isSubmitting ? 'Processing...' : 'Book Now'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
