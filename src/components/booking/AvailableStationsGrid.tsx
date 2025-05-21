
import React from 'react';
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
}

const AvailableStationsGrid: React.FC<AvailableStationsGridProps> = ({
  selectedDate,
  selectedTimeSlot,
  stationType,
  selectedStations,
  onStationSelect,
  onStationTypeChange,
  loading: externalLoading = false,
}) => {
  const { 
    availableStations,
    loading: stationsLoading
  } = useStationAvailability({ 
    selectedDate, 
    selectedTimeSlot 
  });
  
  const isLoading = externalLoading || stationsLoading;
  
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
      />
      
      <StationGrid
        stations={availableStations}
        selectedStations={selectedStations}
        onStationSelect={onStationSelect}
        stationType={stationType}
      />
    </div>
  );
};

export default AvailableStationsGrid;
