
import React from 'react';
import { Station } from '@/types/pos.types';
import { Gamepad2, Table2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIsMobile } from '@/hooks/use-mobile';

interface AvailableStationsGridProps {
  stations: Station[];
  selectedStations: Station[];
  loading: boolean;
  timeSlot: { startTime: string; endTime: string } | null;
  onStationSelect: (station: Station) => void;
  multiSelect?: boolean;
}

const AvailableStationsGrid = ({
  stations,
  selectedStations,
  loading,
  timeSlot,
  onStationSelect,
  multiSelect = false
}: AvailableStationsGridProps) => {
  const isMobile = useIsMobile();
  
  // Sort stations by type and name with a numerical sort
  const sortedStations = [...stations].sort((a, b) => {
    // First sort by type (ps5 first, then 8ball)
    if (a.type !== b.type) {
      return a.type === 'ps5' ? -1 : 1;
    }
    
    // Then sort numerically by extracting numbers from the name
    const aMatch = a.name.match(/(\d+)/);
    const bMatch = b.name.match(/(\d+)/);
    
    if (aMatch && bMatch) {
      return parseInt(aMatch[0]) - parseInt(bMatch[0]);
    }
    
    // Fallback to alphabetical sort if no numbers found
    return a.name.localeCompare(b.name);
  });

  // Group stations by type for UI display
  const ps5Stations = sortedStations.filter(station => station.type === 'ps5');
  const ballStations = sortedStations.filter(station => station.type === '8ball');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading available stations...</span>
      </div>
    );
  }
  
  if (!timeSlot) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium">Please Select a Time Slot First</h3>
        <p className="text-gray-400 mt-2">Available stations will be shown here</p>
      </div>
    );
  }
  
  if (sortedStations.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
        <h3 className="text-lg font-medium">No Stations Available</h3>
        <p className="text-gray-400 mt-2">All stations are booked for this time slot</p>
        <p className="text-gray-400">Please select a different time</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ps5Stations.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Gamepad2 className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
            PS5 Stations
          </h3>
          <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "sm:grid-cols-2 md:grid-cols-3 gap-4"}`}>
            {ps5Stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isSelected={selectedStations.some(s => s.id === station.id)}
                onSelect={() => onStationSelect(station)}
                multiSelect={multiSelect}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      )}
      
      {ballStations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Table2 className="mr-2 h-5 w-5 text-green-400" />
            Pool Tables
          </h3>
          <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "sm:grid-cols-2 md:grid-cols-3 gap-4"}`}>
            {ballStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isSelected={selectedStations.some(s => s.id === station.id)}
                onSelect={() => onStationSelect(station)}
                multiSelect={multiSelect}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      )}
      
      {multiSelect && (
        <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex items-center text-sm text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cuephoria-lightpurple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>You can select multiple stations for group bookings.</span>
          </div>
        </div>
      )}
    </div>
  );
};

const StationCard = ({ 
  station, 
  isSelected, 
  onSelect,
  multiSelect = false,
  isMobile = false
}: { 
  station: Station; 
  isSelected: boolean; 
  onSelect: () => void; 
  multiSelect?: boolean;
  isMobile?: boolean;
}) => {
  const isPs5 = station.type === 'ps5';
  
  return (
    <div
      className={`border rounded-lg ${isMobile ? 'p-3' : 'p-4'} transition-all ${
        isSelected
          ? isPs5
            ? 'border-cuephoria-purple bg-cuephoria-purple/10 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
            : 'border-green-600 bg-green-900/10 shadow-[0_0_10px_rgba(22,163,74,0.3)]'
          : 'border-gray-800 bg-gray-800/20 hover:bg-gray-800/40'
      } ${multiSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {isPs5 ? (
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-cuephoria-purple/20 flex items-center justify-center mr-3`}>
              <Gamepad2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isSelected ? 'text-cuephoria-lightpurple' : 'text-gray-400'}`} />
            </div>
          ) : (
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-green-900/20 flex items-center justify-center mr-3`}>
              <Table2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isSelected ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
          )}
          <div>
            <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
              {station.name}
            </h3>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
              ₹{station.hourlyRate}/hour
            </p>
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className={`${isMobile ? 'text-xs' : 'text-sm'} ${isPs5 ? 'bg-cuephoria-purple/10 text-cuephoria-lightpurple border-cuephoria-purple/30' : 
                       'bg-green-900/10 text-green-400 border-green-600/30'}`}
        >
          {isPs5 ? 'PS5' : '8-Ball'}
        </Badge>
      </div>
      
      <Button
        variant={isSelected ? "default" : "outline"}
        size={isMobile ? "sm" : "sm"}
        className={`mt-3 w-full ${
          isSelected
            ? isPs5
              ? 'bg-cuephoria-purple hover:bg-cuephoria-purple/90'
              : 'bg-green-700 hover:bg-green-700/90'
            : ''
        } ${isMobile ? 'text-xs py-1' : ''}`}
        onClick={onSelect}
      >
        {isSelected ? (multiSelect ? 'Selected' : 'Selected') : (multiSelect ? 'Select' : 'Select')}
      </Button>

      {multiSelect && isSelected && (
        <div className="mt-2 text-center">
          <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-cuephoria-lightpurple`}>
            Click again to deselect
          </span>
        </div>
      )}
    </div>
  );
};

export default AvailableStationsGrid;
