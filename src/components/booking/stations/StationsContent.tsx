
import React from 'react';
import { Station } from '@/types/pos.types';
import { TabsContent } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import StationCard from './StationCard';
import EmptyStateMessage from './EmptyStateMessage';

interface StationsContentProps {
  stationType: 'ps5' | '8ball' | 'all';
  stations: Station[];
  filteredStations: Station[];
  selectedStations: Station[];
  loading: boolean;
  multiSelect?: boolean;
  onStationSelect: (station: Station) => void;
}

const StationsContent: React.FC<StationsContentProps> = ({
  stationType,
  stations,
  filteredStations,
  selectedStations,
  loading,
  multiSelect = false,
  onStationSelect
}) => {
  const isMobile = useIsMobile();
  
  return (
    <TabsContent value={stationType} className="mt-0 pt-0">
      {loading ? (
        <EmptyStateMessage loading={true} />
      ) : filteredStations.length === 0 ? (
        <EmptyStateMessage stationType={stationType} />
      ) : (
        <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "sm:grid-cols-2 md:grid-cols-3 gap-4"}`}>
          {filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              isSelected={selectedStations.some(s => s.id === station.id)}
              onSelect={() => onStationSelect(station)}
              multiSelect={multiSelect}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default StationsContent;
