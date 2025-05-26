
import React, { useMemo } from 'react';
import { Station } from '@/types/pos.types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import StationTypeFilter from './stations/StationTypeFilter';
import StationGrid from './stations/StationGrid';
import NoTimeSlotMessage from './stations/NoTimeSlotMessage';
import { useStationAvailability } from './stations/useStationAvailability';

interface AvailableStationsGridProps {
  selectedDate: Date;
  selectedTimeSlot: { startTime: string; endTime: string } | null;
  stationType: 'ps5' | '8ball' | 'all';
  selectedStations: Station[];
  onStationSelect: (station: Station) => void;
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
  loading?: boolean;
  isMobile?: boolean; // Added the isMobile prop
}

// Memoized station grid component to prevent unnecessary re-renders
const AvailableStationsGridContent = React.memo(({
  availableStations,
  selectedStations,
  stationType,
  onStationSelect
}: {
  availableStations: Station[];
  selectedStations: Station[];
  stationType: 'ps5' | '8ball' | 'all';
  onStationSelect: (station: Station) => void;
}) => (
  <StationGrid
    stations={availableStations}
    selectedStations={selectedStations}
    onStationSelect={onStationSelect}
    stationType={stationType}
  />
));

const AvailableStationsGrid: React.FC<AvailableStationsGridProps> = ({
  selectedDate,
  selectedTimeSlot,
  stationType,
  selectedStations,
  onStationSelect,
  onStationTypeChange,
  loading: externalLoading = false,
  isMobile = false, // Added the isMobile prop with default value
}) => {
  const { 
    availableStations,
    loading: stationsLoading
  } = useStationAvailability({ 
    selectedDate, 
    selectedTimeSlot 
  });
  
  const isLoading = externalLoading || stationsLoading;
  
  // Filter stations by type
  const filteredStations = useMemo(() => {
    if (stationType === 'all') {
      return availableStations;
    }
    return availableStations.filter(station => station.type === stationType);
  }, [availableStations, stationType]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-center">
        <LoadingSpinner />
        <span className="ml-2">Loading available stations...</span>
      </div>
    );
  }
  
  if (!selectedTimeSlot) {
    return <NoTimeSlotMessage />;
  }
  
  return (
    <div>
      <StationTypeFilter 
        stationType={stationType} 
        onStationTypeChange={onStationTypeChange} 
        isMobile={isMobile} // Pass the isMobile prop to StationTypeFilter
      />
      
      <AvailableStationsGridContent
        availableStations={filteredStations}
        selectedStations={selectedStations}
        stationType={stationType}
        onStationSelect={onStationSelect}
      />
    </div>
  );
};

export default React.memo(AvailableStationsGrid);
