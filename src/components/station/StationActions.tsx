
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Station, Customer } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';

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
      
      // Try to start session, but don't let Supabase issues block the UI
      await onStartSession(station.id, selectedCustomerId)
        .catch(error => {
          console.error("Error communicating with Supabase:", error);
          // Continue with local state updates even if Supabase fails
        });
      
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
        console.log('Ending session for station:', station.id);
        
        // Attempt to end session, but continue even if Supabase connection fails
        await onEndSession(station.id)
          .catch(error => {
            console.error("Error communicating with Supabase:", error);
            // Continue with UI updates even if Supabase fails
          });
        
        toast({
          title: "Session Ended",
          description: "Session has been ended and added to cart. Redirecting to checkout...",
        });
        
        // Longer delay before redirecting to ensure state updates complete
        setTimeout(() => {
          navigate('/pos');
        }, 3000);
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

  // Helper function to filter eligible customers who have valid memberships
  const getEligibleCustomers = () => {
    return customers.filter(customer => 
      customer.isMember && 
      (customer.membershipHoursLeft === undefined || customer.membershipHoursLeft > 0)
    );
  };

  const eligibleCustomers = getEligibleCustomers();

  if (station.isOccupied) {
    return (
      <Button 
        variant="destructive" 
        className="w-full btn-hover-effect"
        onClick={handleEndSession}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "End Session"}
      </Button>
    );
  }

  return (
    <>
      <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} disabled={isLoading}>
        <SelectTrigger className="font-quicksand">
          <SelectValue placeholder="Select Customer" />
        </SelectTrigger>
        <SelectContent>
          {eligibleCustomers.length === 0 ? (
            <SelectItem value="no-customers" disabled>No eligible customers available</SelectItem>
          ) : (
            eligibleCustomers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id} className="font-quicksand">
                {customer.name} {customer.membershipHoursLeft !== undefined ? `(${customer.membershipHoursLeft}h left)` : ''}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Button 
        variant="default" 
        className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90 transition-opacity"
        disabled={!selectedCustomerId || isLoading} 
        onClick={handleStartSession}
      >
        {isLoading ? "Starting..." : "Start Session"}
      </Button>
    </>
  );
};

export default StationActions;
