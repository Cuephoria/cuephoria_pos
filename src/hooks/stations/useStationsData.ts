
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
      
      // Add a small delay to ensure any UI operations are completed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Delete from Supabase with more detailed error handling
      console.log(`Sending delete request to Supabase for station ID: ${stationId}`);
      const { error, data } = await supabase
        .from('stations')
        .delete()
        .eq('id', stationId)
        .select();
        
      console.log("Delete response data:", data);
      
      if (error) {
        const errorMessage = handleSupabaseError(error, 'delete station');
        console.error('Supabase delete error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        
        toast({
          title: 'Database Error',
          description: `Failed to delete station: ${errorMessage}`,
          variant: 'destructive'
        });
        return false;
      }
      
      console.log(`Station with ID ${stationId} deleted successfully`);
      
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
  
  const updateStation = async (station: Station) => {
    try {
      setStationsLoading(true);
      console.log("Starting update operation for station:", station);
      
      if (!station.id) {
        console.error('Cannot update station without an ID');
        toast({
          title: 'Error',
          description: 'Invalid station data',
          variant: 'destructive'
        });
        return false;
      }
      
      // If station is occupied, we shouldn't allow changing certain properties
      if (station.isOccupied) {
        toast({
          title: 'Warning',
          description: 'Some properties cannot be changed while the station is occupied',
        });
      }
      
      // Map to database format
      const { error } = await supabase
        .from('stations')
        .update({
          name: station.name,
          type: station.type,
          hourly_rate: station.hourlyRate,
          is_occupied: station.isOccupied
        })
        .eq('id', station.id);
        
      if (error) {
        const errorMessage = handleSupabaseError(error, 'update station');
        console.error('Supabase error details:', error);
        toast({
          title: 'Database Error',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
      setStations(prev => prev.map(s => 
        s.id === station.id ? station : s
      ));
      
      toast({
        title: 'Station Updated',
        description: 'The station has been updated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateStation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update station',
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
    deleteStation,
    updateStation
  };
};
