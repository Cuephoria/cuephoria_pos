
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
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all" className={isMobile ? "text-xs px-2" : "text-sm"}>
            All
          </TabsTrigger>
          <TabsTrigger 
            value="ps5" 
            className={`${isMobile ? "text-xs px-1" : "text-sm"} flex items-center gap-1 justify-center`}
          >
            <Gamepad2 className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} /> 
            PS5
          </TabsTrigger>
          <TabsTrigger 
            value="8ball" 
            className={`${isMobile ? "text-xs px-1" : "text-sm"} flex items-center gap-1 justify-center`}
          >
            <CircleDashed className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} /> 
            Pool
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default StationTypeFilter;
