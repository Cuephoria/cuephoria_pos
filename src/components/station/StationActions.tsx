
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Station, Customer } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, User, Pause, CirclePause } from "lucide-react";
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
  const { selectCustomer, pauseSession, resumeSession } = usePOS();
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

  const handlePauseResumeSession = async () => {
    if (!station.isOccupied || !station.currentSession) return;

    try {
      setIsLoading(true);
      const isPaused = station.currentSession.isPaused || false;

      if (isPaused) {
        // Resume session
        const success = await resumeSession(station.id);
        if (success) {
          toast({
            title: "Session Resumed",
            description: `Session for ${station.name} has been resumed`,
          });
        }
      } else {
        // Pause session
        const success = await pauseSession(station.id);
        if (success) {
          toast({
            title: "Session Paused",
            description: `Session for ${station.name} has been paused`,
          });
        }
      }
    } catch (error) {
      console.error("Error toggling pause state:", error);
      toast({
        title: "Error",
        description: "Failed to update session state. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (station.isOccupied && station.currentSession) {
    const isPaused = station.currentSession.isPaused || false;
    
    return (
      <div className="space-y-3 w-full">
        <Button 
          variant="secondary" 
          className={`w-full text-white font-bold py-3 ${isPaused 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-amber-500 hover:bg-amber-600'}`}
          onClick={handlePauseResumeSession}
          disabled={isLoading}
        >
          {isLoading ? (
            "Processing..."
          ) : isPaused ? (
            <>Resume Session <Pause className="ml-2 h-4 w-4" /></>
          ) : (
            <>Pause Session <Pause className="ml-2 h-4 w-4" /></>
          )}
        </Button>
        
        <Button 
          variant="destructive" 
          className="w-full text-white font-bold py-3 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 transition-opacity"
          onClick={handleEndSession}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "End Session"}
        </Button>
      </div>
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
              customers.find((customer) => customer.id === selectedCustomerId)?.name
            ) : (
              customers.length === 0 ? "No customers available" : "Select customer..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search customers..." />
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => {
                      setSelectedCustomerId(customer.id === selectedCustomerId ? "" : customer.id);
                      setOpen(false);
                    }}
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
              </CommandList>
            </CommandGroup>
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
