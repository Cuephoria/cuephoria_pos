
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Station } from '@/types/pos.types';
import { toast } from 'sonner';
import { checkStationAvailability } from '@/utils/booking/availabilityUtils';
import { formatDate } from '@/utils/booking/formatters';

// Cache for station availability to avoid redundant API calls
const availabilityCache = new Map<string, { data: Station[], timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

interface UseStationAvailabilityProps {
  selectedDate: Date | null;
  selectedTimeSlot: { startTime: string; endTime: string } | null;
}

export const useStationAvailability = ({ selectedDate, selectedTimeSlot }: UseStationAvailabilityProps) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [availableStations, setAvailableStations] = useState<Station[]>([]);
  const [unavailableStationIds, setUnavailableStationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Generate cache key based on date and time slot
  const generateCacheKey = useCallback(() => {
    if (!selectedDate || !selectedTimeSlot) return '';
    return `${formatDate(selectedDate)}_${selectedTimeSlot.startTime}_${selectedTimeSlot.endTime}`;
  }, [selectedDate, selectedTimeSlot]);

  // Fetch all stations on hook initialization
  useEffect(() => {
    console.log("Hook initialized, fetching stations");
    fetchStations();
  }, []);
  
  // Filter available stations when date or time slot changes
  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      console.log("Date or time changed, filtering stations");
      filterAvailableStations();
    }
  }, [selectedDate, selectedTimeSlot, stations]);

  // Fetch all stations from Supabase
  const fetchStations = async () => {
    setLoading(true);
    
    try {
      console.log("Fetching stations from Supabase");
      const { data: stationsData, error } = await supabase
        .from('stations')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      console.log("Stations fetched:", stationsData?.length);
      
      // Transform data to match Station type
      const transformedStations: Station[] = stationsData?.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as 'ps5' | '8ball',
        hourlyRate: item.hourly_rate,
        isOccupied: item.is_occupied,
        currentSession: null
      })) || [];
      
      setStations(transformedStations);
      
      if (selectedDate && selectedTimeSlot) {
        await filterAvailableStations(transformedStations);
      } else {
        setAvailableStations(transformedStations);
        setUnavailableStationIds([]);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter stations based on selected date and time with caching
  const filterAvailableStations = async (stationsList = stations) => {
    if (!selectedDate || !selectedTimeSlot) {
      console.log("Missing date or time slot, can't filter stations");
      setAvailableStations(stationsList);
      setUnavailableStationIds([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const cacheKey = generateCacheKey();
      
      // Use cached data if available and not expired
      if (cacheKey && availabilityCache.has(cacheKey)) {
        const cachedData = availabilityCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
          console.log('Using cached station availability data');
          setAvailableStations(cachedData.data);
          setLoading(false);
          return;
        }
      }
      
      console.log("Filtering available stations for", formatDate(selectedDate), 
        "from", selectedTimeSlot.startTime, "to", selectedTimeSlot.endTime);
      
      const formattedDate = formatDate(selectedDate);
      
      // Get all station IDs
      const allStationIds = stationsList.map(station => station.id);
      
      // Check availability for all stations for this specific time slot
      const { available, unavailableStationIds } = await checkStationAvailability(
        allStationIds,
        formattedDate,
        selectedTimeSlot.startTime,
        selectedTimeSlot.endTime
      );
      
      console.log("Unavailable station IDs:", unavailableStationIds);
      
      // Store unavailable station IDs in state
      setUnavailableStationIds(unavailableStationIds);
      
      // Filter out unavailable stations for display
      const availableStationsFiltered = stationsList.filter(
        station => !unavailableStationIds.includes(station.id)
      );
      
      console.log("Available stations:", availableStationsFiltered.length);
      
      // Store in cache
      if (cacheKey) {
        availabilityCache.set(cacheKey, {
          data: availableStationsFiltered,
          timestamp: Date.now()
        });
      }
      
      setAvailableStations(availableStationsFiltered);
    } catch (error) {
      console.error('Error filtering available stations:', error);
      // Fallback to showing all stations
      setAvailableStations(stationsList);
      setUnavailableStationIds([]);
      toast.error('Could not verify station availability');
    } finally {
      setLoading(false);
    }
  };

  return {
    stations,
    availableStations,
    unavailableStationIds,
    loading,
    fetchStations,
    filterAvailableStations
  };
};
