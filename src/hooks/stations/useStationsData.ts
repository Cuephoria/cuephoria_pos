
import { useState, useEffect } from 'react';
import { Station, Session } from '@/types/pos.types';
import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';

/**
 * Hook to load and manage station data from Supabase
 */
export const useStationsData = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState<boolean>(false);
  const [stationsError, setStationsError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const refreshStations = async () => {
    setStationsLoading(true);
    setStationsError(null);
    
    try {
      // Fetch stations from Supabase
      const { data, error } = await supabase
        .from('stations')
        .select('*');
        
      if (error) {
        console.error('Error fetching stations:', error);
        setStationsError(new Error(`Failed to fetch stations: ${error.message}`));
        toast({
          title: 'Database Error',
          description: 'Failed to fetch stations from database',
          variant: 'destructive'
        });
        // Use empty array if error
        setStations([]);
        return;
      }
      
      // Transform data to match our Station type
      if (data && data.length > 0) {
        const transformedStations: Station[] = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as 'ps5' | '8ball', // Cast to the correct type
          hourlyRate: item.hourly_rate,
          isOccupied: item.is_occupied,
          currentSession: null
        }));
        
        setStations(transformedStations);
        console.log("Loaded stations from Supabase:", transformedStations);
      } else {
        console.log("No stations found in Supabase");
        toast({
          title: 'Info',
          description: 'No stations found in database. Please add stations.',
        });
        setStations([]);
      }
    } catch (error) {
      console.error('Error in fetchStations:', error);
      setStationsError(error instanceof Error ? error : new Error('Unknown error fetching stations'));
      toast({
        title: 'Error',
        description: 'Failed to load stations',
        variant: 'destructive'
      });
      // Use empty array if error
      setStations([]);
    } finally {
      setStationsLoading(false);
    }
  };
  
  const deleteStation = async (stationId: string) => {
    try {
      setStationsLoading(true);
      console.log("Starting delete operation for station ID:", stationId);
      
      // Check if the station is occupied first
      const station = stations.find(s => s.id === stationId);
      if (!station) {
        console.error('Station not found:', stationId);
        toast({
          title: 'Error',
          description: 'Station not found',
          variant: 'destructive'
        });
        return false;
      }
      
      if (station.isOccupied) {
        toast({
          title: 'Cannot Delete',
          description: 'Cannot delete an occupied station. End the current session first.',
          variant: 'destructive'
        });
        return false;
      }
      
      console.log("Station to delete:", {
        id: station.id,
        name: station.name,
        type: station.type,
        isOccupied: station.isOccupied
      });
      
      // Delete from Supabase with more detailed error handling
      const { error, count } = await supabase
        .from('stations')
        .delete()
        .eq('id', stationId)
        .select('count');
        
      if (error) {
        const errorMessage = handleSupabaseError(error, 'delete station');
        console.error('Supabase error details:', error);
        toast({
          title: 'Database Error',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }
      
      console.log(`Deleted ${count} rows from stations table`);
      
      // Update local state
      setStations(prev => {
        const updatedStations = prev.filter(station => station.id !== stationId);
        console.log(`Updated stations list: ${updatedStations.length} stations remaining`);
        return updatedStations;
      });
      
      toast({
        title: 'Station Deleted',
        description: 'The station has been removed successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteStation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete station',
        variant: 'destructive'
      });
      return false;
    } finally {
      setStationsLoading(false);
    }
  };
  
  useEffect(() => {
    refreshStations();
  }, []);
  
  return {
    stations,
    setStations,
    stationsLoading,
    stationsError,
    refreshStations,
    deleteStation
  };
};
