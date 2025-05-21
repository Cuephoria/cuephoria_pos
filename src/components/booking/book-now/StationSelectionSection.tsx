
import React from 'react';
import { Station } from '@/types/pos.types';
import ControllerManagement from '@/components/booking/ControllerManagement';
import AvailableStationsGrid from '@/components/booking/AvailableStationsGrid';
import { useIsMobile } from '@/hooks/use-mobile';

interface StationSelectionSectionProps {
  selectedDate: Date;
  selectedTimeSlot: { startTime: string; endTime: string } | null;
  stationType: 'ps5' | '8ball' | 'all';
  selectedStations: Station[];
  stations: Station[];
  availableControllers: number;
  totalControllers: number;
  loadingStations: boolean;
  unavailableStationIds?: string[];
  onStationSelect: (station: Station) => void;
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
}

const StationSelectionSection: React.FC<StationSelectionSectionProps> = ({
  selectedDate,
  selectedTimeSlot,
  stationType,
  selectedStations,
  stations,
  availableControllers,
  totalControllers,
  loadingStations,
  unavailableStationIds = [],
  onStationSelect,
  onStationTypeChange
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div>
      <div className="mb-6 p-4 bg-cuephoria-purple/10 border border-cuephoria-purple/30 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-cuephoria-lightpurple">Multi-Station Booking:</span> You can select multiple gaming stations or pool tables for your session!
        </p>
        
        {selectedTimeSlot && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-cuephoria-lightpurple">Selected Time:</span> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
          </div>
        )}
      </div>
      
      <AvailableStationsGrid 
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        stationType={stationType}
        selectedStations={selectedStations}
        onStationSelect={onStationSelect}
        onStationTypeChange={onStationTypeChange}
        loading={loadingStations}
        unavailableStationIds={unavailableStationIds}
        isMobile={isMobile}
      />
      
      {/* Controller Availability for PS5 */}
      {(stationType === 'ps5' || (stationType === 'all' && stations.some(s => s.type === 'ps5'))) && (
        <div className="mt-6 p-4 bg-gray-800/40 border border-gray-700 rounded-lg">
          <ControllerManagement 
            totalControllers={totalControllers}
            availableControllers={availableControllers}
          />
          <p className="text-xs text-gray-400 mt-2">
            Note: Each PS5 station requires one controller. We have {totalControllers} controllers in total.
          </p>
        </div>
      )}
      
      {selectedStations.length > 0 && (
        <div className="mt-6 p-4 bg-cuephoria-purple/10 border border-cuephoria-purple/30 rounded-lg">
          <h4 className="text-lg font-medium mb-2 text-white">Selected Stations ({selectedStations.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedStations.map(station => (
              <div key={station.id} className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                <span className="text-sm text-gray-200">{station.name}</span>
                <button 
                  onClick={() => onStationSelect(station)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StationSelectionSection;
