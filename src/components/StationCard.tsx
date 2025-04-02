
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Monitor, Users } from 'lucide-react';
import { usePOS, Station, Customer } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { useNavigate } from 'react-router-dom';

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { customers, startSession, endSession } = usePOS();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const navigate = useNavigate();

  // Update elapsed time every second for active sessions
  useEffect(() => {
    if (!station.isOccupied || !station.currentSession) {
      setElapsedTime(0);
      setCost(0);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      return;
    }

    const startTime = new Date(station.currentSession.startTime).getTime();
    
    const updateElapsedTime = () => {
      const now = new Date().getTime();
      const elapsedMs = now - startTime;
      
      // Calculate time components
      const secondsTotal = Math.floor(elapsedMs / 1000);
      const minutesTotal = Math.floor(secondsTotal / 60);
      const hoursTotal = Math.floor(minutesTotal / 60);
      
      // Set displayed time values
      setSeconds(secondsTotal % 60);
      setMinutes(minutesTotal % 60);
      setHours(hoursTotal);
      
      // Update elapsed minutes for cost calculation
      setElapsedTime(minutesTotal);
      
      // Calculate cost based on hourly rate
      const hoursElapsed = elapsedMs / (1000 * 60 * 60);
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
    const customerId = station.currentSession?.customerId;
    endSession(station.id);
    setElapsedTime(0);
    setCost(0);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    
    // Navigate to POS page after ending the session
    if (customerId) {
      navigate('/pos', { state: { fromSession: true, customerId } });
    }
  };

  const formatTimeDisplay = () => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown Customer';
  };

  const stationIcon = station.type === 'ps5' ? <Monitor className="h-8 w-8" /> : <Clock className="h-8 w-8" />;

  return (
    <Card className={`card-hover ${station.isOccupied ? 'border-cuephoria-orange' : 'border-gray-200'} animate-scale-in`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg font-heading">
            {stationIcon}
            <span className="ml-2">{station.name}</span>
          </CardTitle>
          <Badge className={`${station.isOccupied ? 'bg-cuephoria-orange' : 'bg-green-500'} ${station.isOccupied ? 'animate-pulse' : ''}`}>
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
                <span className="font-mono bg-black/10 px-2 py-1 rounded text-cuephoria-lightpurple font-bold">
                  {formatTimeDisplay()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium mt-2">
                <span>Current Cost:</span>
                <CurrencyDisplay amount={cost} className="text-cuephoria-orange font-bold" />
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        {station.isOccupied ? (
          <Button 
            variant="destructive" 
            className="w-full btn-hover-effect"
            onClick={handleEndSession}
          >
            End Session
          </Button>
        ) : (
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
        )}
      </CardFooter>
    </Card>
  );
};

export default StationCard;
