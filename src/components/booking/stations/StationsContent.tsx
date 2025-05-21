
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
}

const StationsContent: React.FC<StationsContentProps> = ({
  stationType,
  stations,
  filteredStations,
  selectedStations,
  loading,
  multiSelect = false,
  onStationSelect,
  unavailableStationIds = []
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

  if (filteredStations.length === 0) {
    return <EmptyStateMessage stationType={stationType} />;
  }

  return (
    <div className="mt-6">
      <StationGrid
        stations={filteredStations}
        selectedStations={selectedStations}
        onStationSelect={onStationSelect}
        stationType={stationType}
        unavailableStationIds={unavailableStationIds}
      />
    </div>
  );
};

export default StationsContent;
