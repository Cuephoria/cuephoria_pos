
import React from 'react';
import { Station } from '@/types/pos.types';
import { Tabs } from '@/components/ui/tabs';
import StationTypeTabs from './stations/StationTypeTabs';
import StationsContent from './stations/StationsContent';
import MultiSelectInfo from './stations/MultiSelectInfo';
import StationTypeFilter from './stations/StationTypeFilter';
import { useIsMobile } from '@/hooks/use-mobile';

interface StationSelectorProps {
  stations: Station[];
  selectedStations: Station[];
  stationType: 'ps5' | '8ball' | 'all';
  loading: boolean;
  multiSelect?: boolean;
  unavailableStationIds?: string[];
  availableControllers?: number;
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
  onStationSelect: (station: Station) => void;
}

const StationSelector = ({
  stations,
  selectedStations,
  stationType,
  loading,
  multiSelect = false,
  unavailableStationIds = [],
  availableControllers = 0,
  onStationTypeChange,
  onStationSelect
}: StationSelectorProps) => {
  // Get mobile state
  const isMobile = useIsMobile();
  
  // Sort stations sequentially by type and number
  const sortedStations = [...stations].sort((a, b) => {
    // First sort by type (ps5 first, then 8ball)
    if (a.type !== b.type) {
      return a.type === 'ps5' ? -1 : 1;
    }
    
    // Extract numbers from station names
    const aMatch = a.name.match(/(\d+)/);
    const bMatch = b.name.match(/(\d+)/);
    
    // If both have numbers, sort by the numeric value
    if (aMatch && bMatch) {
      return parseInt(aMatch[0], 10) - parseInt(bMatch[0], 10);
    }
    
    // Fallback to alphabetical sort if no numbers found
    return a.name.localeCompare(b.name);
  });
  
  // Filter stations by type
  const filteredStations = stationType === 'all' 
    ? sortedStations
    : sortedStations.filter(station => station.type === stationType);
  
  // Create a handler that checks availability before selection
  const handleStationSelect = (station: Station) => {
    // Prevent selection if station is in the unavailable list
    if (unavailableStationIds.includes(station.id)) {
      return;
    }
    
    // For PS5 stations, prevent selection if no controllers available
    // But allow deselection (if it's already selected)
    if (station.type === 'ps5' && availableControllers <= 0 && 
        !selectedStations.some(s => s.id === station.id)) {
      return;
    }
    
    // If it passes the checks, allow selection
    onStationSelect(station);
  };
  
  return (
    <div className="w-full">
      {/* Use dropdown filter for mobile, tabs for desktop */}
      <StationTypeFilter
        stationType={stationType}
        onStationTypeChange={onStationTypeChange}
        isMobile={isMobile}
      />

      <StationsContent
        stationType={stationType}
        stations={stations}
        filteredStations={filteredStations}
        selectedStations={selectedStations}
        loading={loading}
        multiSelect={multiSelect}
        unavailableStationIds={unavailableStationIds}
        availableControllers={availableControllers}
        onStationSelect={handleStationSelect}
      />
      
      <MultiSelectInfo show={multiSelect} />
    </div>
  );
};

export default StationSelector;
