
import React from 'react';
import { Station } from '@/types/pos.types';
import { Gamepad2, Table2, CircleSlash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StationCardProps {
  station: Station;
  isSelected: boolean;
  onSelect: () => void;
  multiSelect?: boolean;
  isMobile?: boolean;
  isBookable?: boolean;
}

const StationCard: React.FC<StationCardProps> = ({ 
  station, 
  isSelected, 
  onSelect,
  multiSelect = false,
  isMobile = false,
  isBookable = true
}) => {
  const isPs5 = station.type === 'ps5';
  
  return (
    <div
      className={`border rounded-lg ${isMobile ? 'p-3' : 'p-4'} transition-all relative ${
        !isBookable 
          ? 'border-gray-700 bg-gray-900/80 opacity-80 cursor-not-allowed'
          : isSelected
            ? isPs5
              ? 'border-cuephoria-purple bg-cuephoria-purple/10 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
              : 'border-green-600 bg-green-900/10 shadow-[0_0_10px_rgba(22,163,74,0.3)]'
            : 'border-gray-800 bg-gray-800/20 hover:bg-gray-800/40 cursor-pointer'
      }`}
      onClick={isBookable ? onSelect : undefined}
      aria-selected={isSelected}
      aria-disabled={!isBookable}
    >
      {/* Overlay for unbookable stations */}
      {!isBookable && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
          <div className="bg-black/60 rounded-full p-2 flex items-center gap-2">
            <CircleSlash className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-400">Not Available</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {isPs5 ? (
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-cuephoria-purple/20 flex items-center justify-center mr-3`}>
              <Gamepad2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isSelected ? 'text-cuephoria-lightpurple' : 'text-gray-400'}`} />
            </div>
          ) : (
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-green-900/20 flex items-center justify-center mr-3`}>
              <Table2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isSelected ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
          )}
          <div>
            <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
              {station.name}
            </h3>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
              ₹{station.hourlyRate}/hour
            </p>
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className={`${isMobile ? 'text-xs' : 'text-sm'} ${
            !isBookable 
              ? 'bg-gray-800 text-gray-400 border-gray-700'
              : isPs5 
                ? 'bg-cuephoria-purple/10 text-cuephoria-lightpurple border-cuephoria-purple/30' 
                : 'bg-green-900/10 text-green-400 border-green-600/30'
          }`}
        >
          {isPs5 ? 'PS5' : '8-Ball'}
        </Badge>
      </div>
      
      <Button
        variant={isSelected ? "default" : "outline"}
        size={isMobile ? "sm" : "sm"}
        className={`mt-3 w-full ${
          !isBookable 
            ? 'bg-gray-800 text-gray-400 hover:bg-gray-800 cursor-not-allowed opacity-60'
            : isSelected
              ? isPs5
                ? 'bg-cuephoria-purple hover:bg-cuephoria-purple/90'
                : 'bg-green-700 hover:bg-green-700/90'
              : ''
        } ${isMobile ? 'text-xs py-1' : ''}`}
        onClick={(e) => {
          if (!isBookable) {
            e.stopPropagation();
            return;
          }
          e.stopPropagation(); // Prevent double-triggering with the parent div onClick
          onSelect();
        }}
        disabled={!isBookable}
      >
        {!isBookable 
          ? 'Unavailable' 
          : isSelected 
            ? 'Selected' 
            : 'Select'
        }
      </Button>

      {isSelected && isBookable && (
        <div className="mt-2 text-center">
          <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} ${isPs5 ? 'text-cuephoria-lightpurple' : 'text-green-400'}`}>
            Click again to deselect
          </span>
        </div>
      )}
    </div>
  );
};

export default StationCard;
