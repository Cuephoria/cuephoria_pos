
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Station } from '@/types/pos.types';
import { toast } from 'sonner';
import { checkStationAvailability } from '@/utils/booking.utils';

interface AvailableStationsGridProps {
  selectedDate: Date;
  selectedTimeSlot: { startTime: string; endTime: string } | null;
  stationType: 'ps5' | '8ball' | 'all';
  selectedStations: Station[];
  onStationSelect: (station: Station) => void;
  onStationTypeChange: (type: 'ps5' | '8ball' | 'all') => void;
  loading?: boolean;
}

const AvailableStationsGrid: React.FC<AvailableStationsGridProps> = ({
  selectedDate,
  selectedTimeSlot,
  stationType,
  selectedStations,
  onStationSelect,
  onStationTypeChange,
  loading = false,
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState<boolean>(true);
  
  // Fetch all stations on component mount
  useEffect(() => {
    fetchStations();
  }, []);
  
  // Filter available stations when date or time slot changes
  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      filterAvailableStations();
    } else {
      // If no date or time slot is selected, show all stations
      setAvailableStations(stations);
    }
  }, [selectedDate, selectedTimeSlot, stations]);
  
  // Fetch all stations from Supabase
  const fetchStations = async () => {
    setLoadingStations(true);
    
    try {
      const { data: stationsData, error } = await supabase
        .from('stations')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      // Transform data to match Station type
      const transformedStations: Station[] = stationsData?.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as 'ps5' | '8ball',
        hourlyRate: item.hourly_rate,
        isOccupied: item.is_occupied,
        currentSession: null
      })) || [];
      
      console.log('Fetched stations:', transformedStations);
      setStations(transformedStations);
      
      // Initially set all stations as available
      setAvailableStations(transformedStations);
      
      if (selectedDate && selectedTimeSlot) {
        filterAvailableStations(transformedStations);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setLoadingStations(false);
    }
  };
  
  // Filter stations based on selected date and time
  const filterAvailableStations = async (stationsList = stations) => {
    if (!selectedDate || !selectedTimeSlot) {
      setAvailableStations(stationsList);
      return;
    }
    
    setLoadingStations(true);
    
    try {
      const formattedDate = formatDate(selectedDate);
      
      // Get all station IDs
      const allStationIds = stationsList.map(station => station.id);
      
      if (allStationIds.length === 0) {
        console.log('No stations to check availability for');
        setAvailableStations([]);
        setLoadingStations(false);
        return;
      }
      
      console.log('Checking availability for stations:', allStationIds);
      
      // Check availability for all stations
      const { unavailableStationIds } = await checkStationAvailability(
        allStationIds,
        formattedDate,
        selectedTimeSlot.startTime,
        selectedTimeSlot.endTime
      );
      
      console.log('Unavailable station IDs:', unavailableStationIds);
      
      // Filter out unavailable stations
      const available = stationsList.filter(
        station => !unavailableStationIds.includes(station.id)
      );
      
      console.log('Available stations:', available);
      setAvailableStations(available);
    } catch (error) {
      console.error('Error filtering available stations:', error);
      // Fallback to showing all stations
      setAvailableStations(stationsList);
      toast.error('Could not verify station availability');
    } finally {
      setLoadingStations(false);
    }
  };
  
  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Get stations to display based on type filter
  const getFilteredStations = () => {
    if (stationType === 'all') {
      return availableStations;
    }
    
    return availableStations.filter(station => station.type === stationType);
  };
  
  if (loading || loadingStations) {
    return (
      <div className="flex items-center justify-center h-48 text-center">
        <LoadingSpinner />
        <span className="ml-2">Loading available stations...</span>
      </div>
    );
  }
  
  if (!selectedTimeSlot) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400">Please select a time slot first</p>
      </div>
    );
  }
  
  const filteredStations = getFilteredStations();
  
  return (
    <div>
      {/* Station Type Filter */}
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
      
      {/* Available Stations Grid */}
      {filteredStations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStations.map((station) => (
            <div 
              key={station.id}
              onClick={() => onStationSelect(station)}
              className={`
                p-4 rounded-lg cursor-pointer transition-all border-2
                ${selectedStations.some(s => s.id === station.id)
                  ? 'border-cuephoria-purple bg-cuephoria-purple/10'
                  : 'border-gray-800 bg-gray-800/50 hover:bg-gray-800'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{station.name}</h4>
                <div 
                  className={`h-5 w-5 rounded-full ${
                    selectedStations.some(s => s.id === station.id)
                      ? 'bg-cuephoria-purple'
                      : 'bg-gray-700'
                  }`}
                >
                  {selectedStations.some(s => s.id === station.id) && (
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
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border border-gray-800 rounded-md">
          <p className="text-gray-400">
            No {stationType !== 'all' ? (stationType === 'ps5' ? 'PlayStation 5 stations' : 'pool tables') : 'stations'} available for the selected time slot
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableStationsGrid;
