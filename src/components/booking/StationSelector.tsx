
import React from 'react';
import { Station } from '@/types/pos.types';
import { Gamepad2, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIsMobile } from '@/hooks/use-mobile';

interface StationSelectorProps {
  stations: Station[];
  selectedStations: Station[];
  stationType: 'ps5' | '8ball' | 'all';
  loading: boolean;
  multiSelect?: boolean;
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
  onStationSelect: (station: Station) => void;
}

const StationSelector = ({
  stations,
  selectedStations,
  stationType,
  loading,
  multiSelect = false,
  onStationTypeChange,
  onStationSelect
}: StationSelectorProps) => {
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
  
  // Filter stations by type
  const filteredStations = stationType === 'all' 
    ? sortedStations
    : sortedStations.filter(station => station.type === stationType);
  
  // Group stations by type for UI display
  const ps5Stations = sortedStations.filter(station => station.type === 'ps5');
  const ballStations = sortedStations.filter(station => station.type === '8ball');
  
  return (
    <div className="w-full">
      <Tabs 
        defaultValue={stationType}
        onValueChange={(value) => onStationTypeChange(value as 'ps5' | '8ball' | 'all')}
        className="w-full"
      >
        <TabsList className={`grid grid-cols-3 ${isMobile ? 'mb-4' : 'mb-6'} w-full max-w-full overflow-x-auto`}>
          <TabsTrigger value="all" className={isMobile ? "text-xs px-2" : ""}>All Stations</TabsTrigger>
          <TabsTrigger value="ps5" className={isMobile ? "text-xs px-2" : ""}>
            <Gamepad2 className={`${isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`} /> 
            PS5 ({ps5Stations.length})
          </TabsTrigger>
          <TabsTrigger value="8ball" className={isMobile ? "text-xs px-2" : ""}>
            <Table2 className={`${isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`} /> 
            Pool ({ballStations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={stationType} className="mt-0 pt-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
              <span className="ml-2">Loading stations...</span>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium">No Stations Available</h3>
              <p className="text-gray-400 mt-2">Please try a different filter</p>
            </div>
          ) : (
            <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "sm:grid-cols-2 md:grid-cols-3 gap-4"}`}>
              {filteredStations.map((station) => (
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
          )}
        </TabsContent>
      </Tabs>
      
      {multiSelect && (
        <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex items-center text-sm text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cuephoria-lightpurple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>You can select multiple stations for group bookings. All stations must be available at the same time slot.</span>
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

export default StationSelector;
