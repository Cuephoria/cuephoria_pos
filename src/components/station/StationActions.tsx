
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

  const handleStartSession = async () => {
    if (selectedCustomerId) {
      try {
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
      }
    }
  };

  const handleEndSession = async () => {
    if (station.isOccupied && station.currentSession) {
      try {
        console.log('Ending session for station:', station.id);
        await onEndSession(station.id);
        
        toast({
          title: "Session Ended",
          description: "Session has been ended and added to cart. Redirecting to checkout...",
        });
        
        setTimeout(() => {
          navigate('/pos');
        }, 300);
      } catch (error) {
        console.error("Error ending session:", error);
        toast({
          title: "Error",
          description: "Failed to end session. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (station.isOccupied) {
    return (
      <Button 
        variant="destructive" 
        className="w-full btn-hover-effect"
        onClick={handleEndSession}
      >
        End Session
      </Button>
    );
  }

  return (
    <>
      <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
        <SelectTrigger className="font-quicksand">
          <SelectValue placeholder="Select Customer" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id} className="font-quicksand">
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        variant="default" 
        className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90 transition-opacity"
        disabled={!selectedCustomerId} 
        onClick={handleStartSession}
      >
        Start Session
      </Button>
    </>
  );
};

export default StationActions;
