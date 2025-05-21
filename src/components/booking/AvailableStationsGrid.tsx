
import React, { useState, useEffect } from 'react';
import { Station } from '@/types/pos.types';
import { useStationAvailability } from './stations/useStationAvailability';
import StationSelector from './StationSelector';
import StationTypeFilter from './stations/StationTypeFilter';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface AvailableStationsGridProps {
  selectedDate: Date;
  selectedTimeSlot: { startTime: string; endTime: string } | null;
  stationType: 'ps5' | '8ball' | 'all';
  selectedStations: Station[];
  onStationSelect: (station: Station) => void;
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
  loading?: boolean;
  isMobile?: boolean;
  unavailableStationIds?: string[];
  availableControllers?: number; 
}

const AvailableStationsGrid: React.FC<AvailableStationsGridProps> = ({
  selectedDate,
  selectedTimeSlot,
  stationType,
  selectedStations,
  onStationSelect,
  onStationTypeChange,
  loading: externalLoading,
  isMobile,
  unavailableStationIds: externalUnavailableIds,
  availableControllers = 0
}) => {
  // If external unavailable IDs are provided, use them, otherwise use what's computed from the hook
  const { stations, availableStations, loading: internalLoading, unavailableStationIds: internalUnavailableIds } = 
    useStationAvailability({ selectedDate, selectedTimeSlot });
  
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const unavailableStationIds = externalUnavailableIds || internalUnavailableIds || [];
  
  // Create a modified handleStationSelect that respects availability
  const handleStationSelect = (station: Station) => {
    // If it's already selected, allow deselection
    if (selectedStations.some(s => s.id === station.id)) {
      onStationSelect(station);
      return;
    }
    
    // Don't allow selection if station is unavailable
    if (unavailableStationIds.includes(station.id)) {
      return;
    }
    
    // For PS5 stations, check controller availability
    if (station.type === 'ps5' && availableControllers <= 0) {
      return;
    }
    
    // If it passes all checks, select the station
    onStationSelect(station);
  };
  
  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h3 className="text-xl font-semibold mb-2 sm:mb-0">Available Stations</h3>
        
        <div className="flex items-center">
          {selectedTimeSlot && (
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className="border-cuephoria-purple text-cuephoria-lightpurple">
                {stations.length - unavailableStationIds.length} available
              </Badge>
              
              {unavailableStationIds.length > 0 && (
                <Badge variant="outline" className="border-red-500 text-red-400">
                  {unavailableStationIds.length} unavailable
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      <StationSelector
        stations={stations}
        selectedStations={selectedStations}
        stationType={stationType}
        onStationTypeChange={onStationTypeChange}
        onStationSelect={handleStationSelect}
        loading={loading}
        multiSelect={true}
        unavailableStationIds={unavailableStationIds}
        availableControllers={availableControllers}
      />
    </div>
  );
};

export default AvailableStationsGrid;
