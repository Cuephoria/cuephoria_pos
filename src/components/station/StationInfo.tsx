
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center text-lg font-heading">
          <Monitor className="h-8 w-8 text-white" />
          <span className="ml-2 text-white font-bold">{station.name}</span>
        </div>
        <Badge className={`${station.isOccupied ? 'bg-orange-500' : 'bg-green-500'} text-white`}>
          {station.isOccupied ? 'Occupied' : 'Available'}
        </Badge>
      </div>
      
      <div className="flex flex-col space-y-2 text-gray-300">
        <div className="flex justify-between text-sm">
          <span>Hourly Rate:</span>
          <CurrencyDisplay amount={station.hourlyRate} className="text-white" />
        </div>
        
        {station.isOccupied && station.currentSession && (
          <div className="flex justify-between text-sm">
            <span>Customer:</span>
            <span className="text-white">{customerName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationInfo;
