
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, CircleDashed, Filter } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  // Get display name for the current filter
  const getFilterDisplayName = () => {
    switch(stationType) {
      case 'all': return 'All';
      case 'ps5': return 'PS5';
      case '8ball': return 'Pool';
      default: return 'All';
    }
  };

  // Dropdown for mobile
  if (isMobile) {
    return (
      <div className="mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter: {getFilterDisplayName()}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full bg-popover min-w-[200px]">
            <DropdownMenuItem onClick={() => onStationTypeChange('all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStationTypeChange('ps5')} className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" /> PS5
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStationTypeChange('8ball')} className="flex items-center gap-2">
              <CircleDashed className="h-4 w-4" /> Pool
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Tabs for desktop
  return (
    <div className="mb-6">
      <Tabs
        value={stationType}
        onValueChange={(value: 'ps5' | '8ball' | 'all') => onStationTypeChange(value)}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all" className="text-sm">
            All
          </TabsTrigger>
          <TabsTrigger 
            value="ps5" 
            className="text-sm flex items-center gap-1 justify-center"
          >
            <Gamepad2 className="h-4 w-4" /> 
            PS5
          </TabsTrigger>
          <TabsTrigger 
            value="8ball" 
            className="text-sm flex items-center gap-1 justify-center"
          >
            <CircleDashed className="h-4 w-4" /> 
            Pool
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default StationTypeFilter;
