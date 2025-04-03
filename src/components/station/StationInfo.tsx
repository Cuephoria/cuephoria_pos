
import React from 'react';
import { Station } from '@/context/POSContext';
import { Badge } from '@/components/ui/badge';
import { Monitor } from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency';

interface StationInfoProps {
  station: Station;
  customerName: string;
}

const StationInfo: React.FC<StationInfoProps> = ({ station, customerName }) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center text-lg font-heading">
          <Monitor className="h-8 w-8 mr-2" />
          <span>{station.name}</span>
        </div>
        <Badge className={`${station.isOccupied ? 'bg-cuephoria-orange' : 'bg-green-500'} text-white rounded-full px-4 py-1`}>
          {station.isOccupied ? 'Occupied' : 'Available'}
        </Badge>
      </div>
      
      <div className="flex flex-col space-y-2 mt-4">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Hourly Rate:</span>
          <CurrencyDisplay amount={station.hourlyRate} />
        </div>
        
        {station.isOccupied && station.currentSession && (
          <div className="flex justify-between text-sm">
            <span className="font-medium">Customer:</span>
            <span>{customerName}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default StationInfo;
