
import React from 'react';

interface StationTypeFilterProps {
  stationType: 'ps5' | '8ball' | 'all';
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
}

const StationTypeFilter: React.FC<StationTypeFilterProps> = ({
  stationType,
  onStationTypeChange,
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">Station Type</h3>
      <div className="flex space-x-2">
        <button
          onClick={() => onStationTypeChange('all')}
          className={`px-4 py-2 rounded-md transition-colors ${
            stationType === 'all' 
              ? 'bg-cuephoria-purple text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Stations
        </button>
        <button
          onClick={() => onStationTypeChange('ps5')}
          className={`px-4 py-2 rounded-md transition-colors ${
            stationType === 'ps5' 
              ? 'bg-cuephoria-purple text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          PlayStation 5
        </button>
        <button
          onClick={() => onStationTypeChange('8ball')}
          className={`px-4 py-2 rounded-md transition-colors ${
            stationType === '8ball' 
              ? 'bg-cuephoria-purple text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Pool Tables
        </button>
      </div>
    </div>
  );
};

export default StationTypeFilter;
