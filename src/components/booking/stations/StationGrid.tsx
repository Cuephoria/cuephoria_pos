
import React from 'react';
import { Station } from '@/types/pos.types';
import StationCard from './StationCard';

interface StationGridProps {
  stations: Station[];
  selectedStations: Station[];
  onStationSelect: (station: Station) => void;
  stationType: 'ps5' | '8ball' | 'all';
}

const StationGrid: React.FC<StationGridProps> = ({
  stations,
  selectedStations,
  onStationSelect,
  stationType,
}) => {
  // Get stations to display based on type filter
  const getFilteredStations = () => {
    // First filter by type if needed
    const typeFiltered = stationType === 'all' 
      ? stations 
      : stations.filter(station => station.type === stationType);
    
    // Then sort them sequentially
    return typeFiltered.sort((a, b) => {
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
  };

  const filteredStations = getFilteredStations();

  if (filteredStations.length === 0) {
    return (
      <div className="text-center py-6 border border-gray-800 rounded-md">
        <p className="text-gray-400">
          No {stationType !== 'all' ? (stationType === 'ps5' ? 'PlayStation 5 stations' : 'pool tables') : 'stations'} available for the selected time slot
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredStations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
          isSelected={selectedStations.some(s => s.id === station.id)}
          onSelect={() => onStationSelect(station)}
        />
      ))}
    </div>
  );
};

export default StationGrid;
