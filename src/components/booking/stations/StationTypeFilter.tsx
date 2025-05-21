
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, CircleDashed } from 'lucide-react';

interface StationTypeFilterProps {
  stationType: 'ps5' | '8ball' | 'all';
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
  isMobile?: boolean;
}

const StationTypeFilter: React.FC<StationTypeFilterProps> = ({ 
  stationType, 
  onStationTypeChange,
  isMobile = false
}) => {
  return (
    <div className="mb-6">
      <Tabs
        value={stationType}
        onValueChange={(value: 'ps5' | '8ball' | 'all') => onStationTypeChange(value)}
        className="w-full"
      >
        <TabsList className={`w-full grid ${isMobile ? 'grid-cols-1 gap-y-2' : 'grid-cols-3'}`}>
          <TabsTrigger value="all" className="text-sm">
            All Stations
          </TabsTrigger>
          <TabsTrigger 
            value="ps5" 
            className="text-sm flex items-center gap-1 justify-center"
          >
            <Gamepad2 className="h-4 w-4" /> 
            PlayStation 5
          </TabsTrigger>
          <TabsTrigger 
            value="8ball" 
            className="text-sm flex items-center gap-1 justify-center"
          >
            <CircleDashed className="h-4 w-4" /> 
            Pool Table
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default StationTypeFilter;
