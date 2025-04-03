
import React from 'react';
import { Station } from '@/context/POSContext';
import { Badge } from '@/components/ui/badge';
import { Clock, Monitor } from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency';

interface StationInfoProps {
  station: Station;
  customerName: string;
}

const StationInfo: React.FC<StationInfoProps> = ({ station, customerName }) => {
  const stationIcon = station.type === 'ps5' ? <Monitor className="h-8 w-8" /> : <Clock className="h-8 w-8" />;

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center text-lg font-heading">
          {stationIcon}
          <span className="ml-2 font-bold">{station.name}</span>
        </div>
        <Badge className={`${station.isOccupied ? 'bg-cuephoria-orange' : 'bg-green-500'} ${station.isOccupied ? 'animate-pulse' : ''}`}>
          {station.isOccupied ? 'Occupied' : 'Available'}
        </Badge>
      </div>
      
      <div className="flex flex-col space-y-2 mt-2">
        <div className="flex justify-between text-sm">
          <span>Hourly Rate:</span>
          <CurrencyDisplay amount={station.hourlyRate} />
        </div>
        
        {station.isOccupied && station.currentSession && (
          <div className="flex justify-between text-sm">
            <span>Customer:</span>
            <span className="font-semibold">{customerName}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default StationInfo;
