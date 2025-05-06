
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Station, Customer } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationActionsProps {
  station: Station;
  customers: Customer[];
  onStartSession: (stationId: string, customerId: string) => Promise<void>;
  onEndSession: (stationId: string) => Promise<void>;
}

const StationActions: React.FC<StationActionsProps> = ({ 
  station, 
  customers, 
  onStartSession, 
  onEndSession 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { selectCustomer } = usePOS();
  const [open, setOpen] = useState(false);
  const [displayedCustomers, setDisplayedCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging to verify customers are being passed
  useEffect(() => {
    console.log("Customers passed to StationActions:", customers.length, customers);
    // Sort customers alphabetically by name
    const sortedCustomers = [...customers].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    console.log("Sorted customers:", sortedCustomers.length);
    setDisplayedCustomers(sortedCustomers);
  }, [customers]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim() === '') {
      setDisplayedCustomers([...customers].sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      ));
    } else {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.phone.toLowerCase().includes(value.toLowerCase())
      );
      setDisplayedCustomers(filtered);
    }
  };

  const handleStartSession = async () => {
    if (!selectedCustomerId) {
      toast({
        title: "Selection Required",
        description: "Please select a customer to start the session",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Starting session - Station ID: ${station.id} (${typeof station.id}), Customer ID: ${selectedCustomerId} (${typeof selectedCustomerId})`);
      
      await onStartSession(station.id, selectedCustomerId);
      
      setSelectedCustomerId('');
      toast({
        title: "Session Started",
        description: `Session started successfully for station ${station.name}`,
      });
    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (station.isOccupied && station.currentSession) {
      try {
        setIsLoading(true);
        
        const customerId = station.currentSession.customerId;
        console.log('Ending session for station:', station.id, 'customer:', customerId);
        
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          console.log('Auto-selecting customer:', customer.name);
          selectCustomer(customer.id);
        }
        
        await onEndSession(station.id);
        
        toast({
          title: "Session Ended",
          description: "Session has been ended and added to cart. Redirecting to checkout...",
        });
        
        setTimeout(() => {
          navigate('/pos');
        }, 1500);
      } catch (error) {
        console.error("Error ending session:", error);
        toast({
          title: "Error",
          description: "Failed to end session. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (station.isOccupied) {
    return (
      <Button 
        variant="destructive" 
        className="w-full text-white font-bold py-3 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 transition-opacity"
        onClick={handleEndSession}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "End Session"}
      </Button>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between mb-3"
            disabled={customers.length === 0}
          >
            {selectedCustomerId ? (
              customers.find((customer) => customer.id === selectedCustomerId)?.name || "Select customer..."
            ) : (
              customers.length === 0 ? "No customers available" : "Select customer..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-background border shadow-md">
          <Command>
            <CommandInput 
              placeholder="Search customers..." 
              value={searchQuery} 
              onValueChange={handleSearchChange}
            />
            <CommandList className="max-h-[300px] overflow-auto">
              <CommandEmpty>No customer found.</CommandEmpty>
              <CommandGroup>
                {displayedCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      setSelectedCustomerId(customer.id === selectedCustomerId ? "" : customer.id);
                      setSearchQuery('');
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button 
        variant="default" 
        className="w-full py-3 text-lg font-bold bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90 transition-opacity"
        disabled={!selectedCustomerId || isLoading || customers.length === 0} 
        onClick={handleStartSession}
      >
        {isLoading ? "Starting..." : customers.length === 0 ? "No Customers Available" : "Start Session"}
      </Button>
    </>
  );
};

export default StationActions;
