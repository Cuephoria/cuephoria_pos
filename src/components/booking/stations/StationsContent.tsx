
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

  // Filter stations for display based on availability
  const displayStations = filteredStations.filter(station => {
    // Always show already selected stations regardless of their current availability
    if (selectedStations.some(s => s.id === station.id)) {
      return true;
    }
    
    // For PS5 stations, check controller availability
    if (station.type === 'ps5') {
      // Hide PS5 stations if there are no controllers available
      if (availableControllers <= 0) {
        return false;
      }
    }
    
    // For all station types, hide if they're in the unavailable list
    if (unavailableStationIds.includes(station.id)) {
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
