
import React from 'react';
import { Station } from '@/types/pos.types';

interface StationCardProps {
  station: Station;
  isSelected: boolean;
  onSelect: () => void;
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  isSelected,
  onSelect,
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`
        p-4 rounded-lg cursor-pointer transition-all border-2
        ${isSelected
          ? 'border-cuephoria-purple bg-cuephoria-purple/10'
          : 'border-gray-800 bg-gray-800/50 hover:bg-gray-800'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{station.name}</h4>
        <div 
          className={`h-5 w-5 rounded-full ${
            isSelected
              ? 'bg-cuephoria-purple'
              : 'bg-gray-700'
          }`}
        >
          {isSelected && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-white" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-400">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="text-gray-300">
            {station.type === 'ps5' ? 'PlayStation 5' : 'Pool Table'}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Rate:</span>
          <span className="text-gray-300">₹{station.hourlyRate}/hour</span>
        </div>
      </div>
    </div>
  );
};

export default StationCard;
