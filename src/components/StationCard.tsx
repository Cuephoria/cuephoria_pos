
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Monitor, Users } from 'lucide-react';
import { usePOS, Station, Customer } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { customers, startSession, endSession } = usePOS();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);

  // Update elapsed time every second for active sessions
  useEffect(() => {
    if (!station.isOccupied || !station.currentSession) return;

    const startTime = new Date(station.currentSession.startTime).getTime();
    
    const updateElapsedTime = () => {
      const now = new Date().getTime();
      const elapsedMs = now - startTime;
      const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
      setElapsedTime(elapsedMinutes);
      
      // Calculate cost based on hourly rate
      const hoursElapsed = elapsedMinutes / 60;
      const calculatedCost = Math.ceil(hoursElapsed * station.hourlyRate);
      setCost(calculatedCost);
    };

    // Initial update
    updateElapsedTime();
    
    // Set interval to update every second
    const interval = setInterval(updateElapsedTime, 1000);
    
    return () => clearInterval(interval);
  }, [station]);

  const handleStartSession = () => {
    if (selectedCustomerId) {
      startSession(station.id, selectedCustomerId);
      setSelectedCustomerId('');
    }
  };

  const handleEndSession = () => {
    endSession(station.id);
    setElapsedTime(0);
    setCost(0);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown Customer';
  };

  const stationIcon = station.type === 'ps5' ? <Monitor className="h-8 w-8" /> : <Clock className="h-8 w-8" />;

  return (
    <Card className={`${station.isOccupied ? 'border-cuephoria-orange' : 'border-gray-200'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            {stationIcon}
            <span className="ml-2">{station.name}</span>
          </CardTitle>
          <Badge className={station.isOccupied ? 'bg-cuephoria-orange' : 'bg-green-500'}>
            {station.isOccupied ? 'Occupied' : 'Available'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm">
            <span>Hourly Rate:</span>
            <CurrencyDisplay amount={station.hourlyRate} />
          </div>
          
          {station.isOccupied && station.currentSession && (
            <>
              <div className="flex justify-between text-sm">
                <span>Customer:</span>
                <span>{getCustomerName(station.currentSession.customerId)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duration:</span>
                <span>{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Current Cost:</span>
                <CurrencyDisplay amount={cost} />
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        {station.isOccupied ? (
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleEndSession}
          >
            End Session
          </Button>
        ) : (
          <>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="default" 
              className="w-full"
              disabled={!selectedCustomerId} 
              onClick={handleStartSession}
            >
              Start Session
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default StationCard;
