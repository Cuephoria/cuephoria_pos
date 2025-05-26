
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Table2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StationTypeTabsProps {
  stationType: 'ps5' | '8ball' | 'all';
  ps5Count: number;
  ballCount: number;
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
}

const StationTypeTabs: React.FC<StationTypeTabsProps> = ({ 
  stationType,
  ps5Count,
  ballCount,
  onStationTypeChange
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs 
      defaultValue={stationType}
      value={stationType}
      onValueChange={(value) => onStationTypeChange(value as 'ps5' | '8ball' | 'all')}
      className="w-full"
    >
      <TabsList className={`grid grid-cols-3 ${isMobile ? 'mb-4' : 'mb-6'} w-full max-w-full overflow-x-auto`}>
        <TabsTrigger value="all" className={isMobile ? "text-xs px-2" : ""}>
          All Stations
        </TabsTrigger>
        <TabsTrigger value="ps5" className={isMobile ? "text-xs px-2" : ""}>
          <Gamepad2 className={`${isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`} /> 
          PS5 ({ps5Count})
        </TabsTrigger>
        <TabsTrigger value="8ball" className={isMobile ? "text-xs px-2" : ""}>
          <Table2 className={`${isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"}`} /> 
          Pool ({ballCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default StationTypeTabs;
