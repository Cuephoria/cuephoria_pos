
import React from 'react';
import { Station } from '@/types/pos.types';
import { Gamepad2, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface StationSelectorProps {
  stations: Station[];
  selectedStation: Station | null;
  stationType: 'ps5' | '8ball' | 'all';
  loading: boolean;
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
  onStationSelect: (station: Station) => void;
}

const StationSelector = ({
  stations,
  selectedStation,
  stationType,
  loading,
  onStationTypeChange,
  onStationSelect
}: StationSelectorProps) => {
  // Filter stations by type
  const filteredStations = stationType === 'all' 
    ? stations
    : stations.filter(station => station.type === stationType);
  
  // Group stations by type for UI display
  const ps5Stations = stations.filter(station => station.type === 'ps5');
  const ballStations = stations.filter(station => station.type === '8ball');
  
  return (
    <div>
      <Tabs 
        defaultValue={stationType}
        onValueChange={(value) => onStationTypeChange(value as 'ps5' | '8ball' | 'all')}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="all">All Stations</TabsTrigger>
          <TabsTrigger value="ps5">
            <Gamepad2 className="mr-2 h-4 w-4" /> PS5 ({ps5Stations.length})
          </TabsTrigger>
          <TabsTrigger value="8ball">
            <Table2 className="mr-2 h-4 w-4" /> Pool ({ballStations.length})
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <span className="ml-2">Loading stations...</span>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
            <h3 className="text-lg font-medium">No Stations Available</h3>
            <p className="text-gray-400 mt-2">Please try a different filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isSelected={selectedStation?.id === station.id}
                onSelect={() => onStationSelect(station)}
              />
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
};

const StationCard = ({ 
  station, 
  isSelected, 
  onSelect 
}: { 
  station: Station; 
  isSelected: boolean; 
  onSelect: () => void; 
}) => {
  const isPs5 = station.type === 'ps5';
  
  return (
    <div
      className={`border rounded-lg p-4 transition-all cursor-pointer ${
        isSelected
          ? isPs5
            ? 'border-cuephoria-purple bg-cuephoria-purple/10 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
            : 'border-green-600 bg-green-900/10 shadow-[0_0_10px_rgba(22,163,74,0.3)]'
          : 'border-gray-800 bg-gray-800/20 hover:bg-gray-800/40'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {isPs5 ? (
            <div className="w-10 h-10 rounded-lg bg-cuephoria-purple/20 flex items-center justify-center mr-3">
              <Gamepad2 className={`h-5 w-5 ${isSelected ? 'text-cuephoria-lightpurple' : 'text-gray-400'}`} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-green-900/20 flex items-center justify-center mr-3">
              <Table2 className={`h-5 w-5 ${isSelected ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
          )}
          <div>
            <h3 className={`font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
              {station.name}
            </h3>
            <p className="text-sm text-gray-400">
              ₹{station.hourlyRate}/hour
            </p>
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className={isPs5 ? 'bg-cuephoria-purple/10 text-cuephoria-lightpurple border-cuephoria-purple/30' : 
                           'bg-green-900/10 text-green-400 border-green-600/30'}
        >
          {isPs5 ? 'PS5' : '8-Ball'}
        </Badge>
      </div>
      
      <Button
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className={`mt-4 w-full ${
          isSelected
            ? isPs5
              ? 'bg-cuephoria-purple hover:bg-cuephoria-purple/90'
              : 'bg-green-700 hover:bg-green-700/90'
            : ''
        }`}
        onClick={onSelect}
      >
        {isSelected ? 'Selected' : 'Select'}
      </Button>
    </div>
  );
};

export default StationSelector;
