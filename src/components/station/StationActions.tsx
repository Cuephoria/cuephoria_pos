
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Loader2, Users } from 'lucide-react';
import { Station, Customer } from '@/types/pos.types';
import { usePOS } from '@/context/POSContext';
import { formatDuration } from '@/utils/time.utils';

interface StationActionsProps {
  station: Station;
  customers: Customer[];
  onStartSession: (stationId: string, customerId: string) => Promise<void>;
  onEndSession: (stationId: string) => Promise<void>;
}

const StationActions: React.FC<StationActionsProps> = ({ station, customers, onStartSession, onEndSession }) => {
  const { selectedCustomer } = usePOS();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStartSession = async (customerId: string) => {
    setIsLoading(true);
    try {
      await onStartSession(station.id, customerId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    setIsLoading(true);
    try {
      await onEndSession(station.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {station.isOccupied ? (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Session Duration:</span>
            <span className="font-semibold">
              {station.currentSession?.startTime
                ? formatDuration(station.currentSession.startTime)
                : 'Loading...'}
            </span>
          </div>
          <Button 
            variant="destructive" 
            className="w-full relative"
            disabled={isLoading}
            onClick={handleEndSession}
          >
            {isLoading && (
              <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
            End Session
          </Button>
        </div>
      ) : (
        <Select onValueChange={handleStartSession}>
          <SelectTrigger className="w-full justify-between">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Start Session" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  );
};

export default StationActions;
