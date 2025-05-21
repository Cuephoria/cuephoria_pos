import React from 'react';
import { Station } from '@/types/pos.types';
import StationGrid from './StationGrid';
import NoTimeSlotMessage from './NoTimeSlotMessage';
import EmptyStateMessage from './EmptyStateMessage';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface StationsContentProps {
  stationType: 'ps5' | '8ball' | 'all';
  stations: Station[];
  filteredStations: Station[];
  selectedStations: Station[];
  loading: boolean;
  multiSelect?: boolean;
  onStationSelect: (station: Station) => void;
  unavailableStationIds?: string[];
  availableControllers?: number;
}

const StationsContent: React.FC<StationsContentProps> = ({
  stationType,
  stations,
  filteredStations,
  selectedStations,
  loading,
  multiSelect = false,
  onStationSelect,
  unavailableStationIds = [],
  availableControllers = 0
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (stations.length === 0) {
    return <NoTimeSlotMessage />;
  }

  // Filter out PS5 stations if there are no controllers available
  // but only if we're not already showing selected PS5 stations (keep those visible)
  const displayStations = filteredStations.filter(station => {
    // If it's not a PS5 station, always show it
    if (station.type !== 'ps5') {
      return true;
    }
    
    // If there are no controllers available AND this station is not already selected, hide it
    if (availableControllers <= 0 && !selectedStations.some(s => s.id === station.id)) {
      return false;
    }
    
    return true;
  });

  if (displayStations.length === 0) {
    return <EmptyStateMessage stationType={stationType} />;
  }

  return (
    <div className="mt-6">
      <StationGrid
        stations={displayStations}
        selectedStations={selectedStations}
        onStationSelect={onStationSelect}
        stationType={stationType}
        unavailableStationIds={unavailableStationIds}
      />
    </div>
  );
};

export default StationsContent;
