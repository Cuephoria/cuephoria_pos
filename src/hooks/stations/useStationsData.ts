
import { useState, useEffect } from 'react';
import { Station, Session } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';

/**
 * Hook to load and manage station data from Supabase
 */
export const useStationsData = (initialStations: Station[]) => {
  const [stations, setStations] = useState<Station[]>(initialStations);
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
        // Fallback to initialStations
        setStations(initialStations);
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
        console.log("No stations found in Supabase, using initial stations:", initialStations);
        // Fallback to initialStations
        setStations(initialStations);
        
        // Try to create the initial stations in Supabase
        for (const station of initialStations) {
          // Generate a proper UUID for each station if it doesn't have one
          const dbStationId = crypto.randomUUID();
          
          try {
            const { error } = await supabase
              .from('stations')
              .insert({
                id: dbStationId,
                name: station.name,
                type: station.type,
                hourly_rate: station.hourlyRate,
                is_occupied: station.isOccupied
              });
              
            if (error) {
              console.error(`Error creating station ${station.name} in Supabase:`, error);
            } else {
              console.log(`Created station ${station.name} in Supabase with ID ${dbStationId}`);
              
              // Update the local state with the new UUID
              setStations(prev => prev.map(s => 
                s.id === station.id ? { ...s, id: dbStationId } : s
              ));
            }
          } catch (error) {
            console.error(`Error in station creation for ${station.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchStations:', error);
      setStationsError(error instanceof Error ? error : new Error('Unknown error fetching stations'));
      toast({
        title: 'Error',
        description: 'Failed to load stations',
        variant: 'destructive'
      });
      // Fallback to initialStations
      setStations(initialStations);
    } finally {
      setStationsLoading(false);
    }
  };
  
  const deleteStation = async (stationId: string) => {
    try {
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
      
      // Handle newly added stations that might not be in Supabase yet
      // or stations that don't have a UUID format
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stationId);
      
      if (isValidUUID) {
        // Delete from Supabase only if it's a valid UUID
        const { error } = await supabase
          .from('stations')
          .delete()
          .eq('id', stationId);
          
        if (error) {
          console.error('Error deleting station from Supabase:', error);
          toast({
            title: 'Database Error',
            description: 'Failed to delete station from database',
            variant: 'destructive'
          });
          return false;
        }
      } else {
        console.log('Skipping Supabase delete for non-UUID station ID:', stationId);
      }
      
      // Update local state (do this regardless of Supabase result)
      setStations(prev => prev.filter(station => station.id !== stationId));
      
      toast({
        title: 'Station Deleted',
        description: 'The station has been removed successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteStation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete station',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  useEffect(() => {
    refreshStations();
  }, [initialStations]);
  
  return {
    stations,
    setStations,
    stationsLoading,
    stationsError,
    refreshStations,
    deleteStation
  };
};
