
import React from 'react';
import { Station } from '@/types/pos.types';
import { Tabs } from '@/components/ui/tabs';
import StationTypeTabs from './stations/StationTypeTabs';
import StationsContent from './stations/StationsContent';
import MultiSelectInfo from './stations/MultiSelectInfo';

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
      <Tabs value={stationType} className="w-full">
        <StationTypeTabs
          stationType={stationType}
          ps5Count={ps5Stations.length}
          ballCount={ballStations.length}
          onStationTypeChange={onStationTypeChange}
        />

        <StationsContent
          stationType={stationType}
          stations={stations}
          filteredStations={filteredStations}
          selectedStations={selectedStations}
          loading={loading}
          multiSelect={multiSelect}
          onStationSelect={onStationSelect}
        />
      </Tabs>
      
      <MultiSelectInfo show={multiSelect} />
    </div>
  );
};

export default StationSelector;
