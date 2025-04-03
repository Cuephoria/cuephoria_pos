
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { usePOS, Station } from '@/context/POSContext';
import StationInfo from '@/components/station/StationInfo';
import StationTimer from '@/components/station/StationTimer';
import StationActions from '@/components/station/StationActions';

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { customers, startSession, endSession } = usePOS();

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown Customer';
  };

  const customerName = station.currentSession 
    ? getCustomerName(station.currentSession.customerId)
    : '';

  return (
    <Card className={`${station.isOccupied ? 'border-cuephoria-orange' : 'border-gray-200'} bg-gray-900 text-white shadow-lg animate-scale-in`}>
      <CardHeader className="pb-2 border-b border-gray-800">
        <StationInfo station={station} customerName={customerName} />
      </CardHeader>
      <CardContent className="pt-4">
        {station.isOccupied && station.currentSession && (
          <StationTimer station={station} />
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t border-gray-800">
        <StationActions 
          station={station}
          customers={customers}
          onStartSession={startSession}
          onEndSession={endSession}
        />
      </CardFooter>
    </Card>
  );
};

export default StationCard;
