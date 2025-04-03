
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Station, Customer } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
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
          >
            {selectedCustomerId
              ? customers.find((customer) => customer.id === selectedCustomerId)?.name
              : "Select customer..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search customer..." className="h-9" />
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      setSelectedCustomerId(customer.id === selectedCustomerId ? "" : customer.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-xs text-muted-foreground">{customer.phone}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Button 
        variant="default" 
        className="w-full py-3 text-lg font-bold bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90 transition-opacity"
        disabled={!selectedCustomerId || isLoading} 
        onClick={handleStartSession}
      >
        {isLoading ? "Starting..." : "Start Session"}
      </Button>
    </>
  );
};

export default StationActions;
