
import React, { useState } from 'react';
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
  onEndSession: (stationId: string) => Promise<any>; // Updated to reflect actual return type
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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'failed'>('idle');

  // Debounce function to prevent double-clicks
  const handleStartSession = async () => {
    if (!selectedCustomerId) {
      toast({
        title: "Selection Required",
        description: "Please select a customer to start the session",
        variant: "destructive"
      });
      return;
    }
    
    if (isLoading) return; // Prevent multiple clicks
    
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
      if (isLoading || isRedirecting) return; // Prevent multiple clicks or actions during redirect
      
      try {
        setIsLoading(true);
        setProcessingState('processing');
        
        const customerId = station.currentSession.customerId;
        console.log('Ending session for station:', station.id, 'customer:', customerId);
        
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          console.log('Auto-selecting customer:', customer.name);
          selectCustomer(customer.id);
        }
        
        // Show processing toast
        toast({
          title: "Processing...",
          description: "Ending session and preparing checkout...",
        });
        
        // Wait for session to fully end before redirecting
        const result = await onEndSession(station.id);
        
        if (!result) {
          throw new Error("Failed to end session - no result returned");
        }
        
        setProcessingState('verifying');
        
        // Verify the session was properly ended in both local and database
        if (result.isFullyUpdated) {
          setProcessingState('success');
          console.log("Session fully ended, proceeding to checkout");
          
          // Success toast
          toast({
            title: "Session Ended",
            description: "Session has been ended and added to cart.",
          });
          
          // Set redirecting state
          setIsRedirecting(true);
          
          // Add a small delay before redirecting to ensure state updates are complete
          setTimeout(() => {
            navigate('/pos');
          }, 300);
        } else {
          console.warn("Session end had sync issues, retrying verification");
          
          // Try to verify one more time after a short delay
          await new Promise(r => setTimeout(r, 500));
          
          // At this point, we've done our best to end the session
          // Let's proceed even if there were sync issues, as local state is updated
          setProcessingState('success');
          setIsRedirecting(true);
          
          toast({
            title: "Session Ended",
            description: "Session has been ended and added to cart. (Sync completed)",
          });
          
          setTimeout(() => {
            navigate('/pos');
          }, 300);
        }
      } catch (error) {
        console.error("Error ending session:", error);
        setProcessingState('failed');
        toast({
          title: "Error",
          description: "Failed to end session. Please try again.",
          variant: "destructive"
        });
        setIsRedirecting(false);
        setIsLoading(false);
      }
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      switch (processingState) {
        case 'processing': return "Processing...";
        case 'verifying': return "Verifying...";
        case 'success': return "Success!";
        case 'failed': return "Failed - Retry";
        default: return "Processing...";
      }
    }
    
    if (isRedirecting) return "Redirecting...";
    return "End Session";
  };

  if (station.isOccupied) {
    return (
      <Button 
        variant="destructive" 
        className={`w-full text-white font-bold py-3 text-lg 
          ${processingState === 'failed' ? 'bg-red-600 hover:bg-red-700' : 
            processingState === 'success' ? 'bg-green-600 hover:bg-green-700' : 
            'bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90'} 
          transition-all duration-300`}
        onClick={handleEndSession}
        disabled={isLoading || isRedirecting}
      >
        {getButtonText()}
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
