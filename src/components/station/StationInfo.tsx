
import React from 'react';
import { Station } from '@/context/POSContext';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, PoolTable } from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency';

interface StationInfoProps {
  station: Station;
  customerName: string;
}

const StationInfo: React.FC<StationInfoProps> = ({ station, customerName }) => {
  // Different styling based on station type
  const isPoolTable = station.type === '8ball';
  
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center text-lg font-heading">
          {isPoolTable ? (
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-900 rounded-md"></div>
              <PoolTable className="h-6 w-6 text-green-300 z-10" />
              <div className="absolute inset-0 border-2 border-green-700 rounded-md"></div>
            </div>
          ) : (
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black rounded-md"></div>
              <Gamepad2 className="h-6 w-6 text-cuephoria-lightpurple z-10" />
              <div className="absolute bottom-0 h-1 w-8 mx-auto bg-cuephoria-purple rounded-t-lg"></div>
            </div>
          )}
          <span className={`ml-2 font-bold ${isPoolTable ? 'text-green-500' : 'text-cuephoria-lightpurple'}`}>
            {station.name}
          </span>
        </div>
        <Badge 
          className={`
            ${station.isOccupied 
              ? 'bg-cuephoria-orange text-white' 
              : isPoolTable 
                ? 'bg-green-500 text-white' 
                : 'bg-cuephoria-lightpurple text-white'
            } 
            ${station.isOccupied ? 'animate-pulse' : ''}
          `}
        >
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
