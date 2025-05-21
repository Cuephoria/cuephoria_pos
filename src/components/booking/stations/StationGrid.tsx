
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
    if (stationType === 'all') {
      return stations;
    }
    return stations.filter(station => station.type === stationType);
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
