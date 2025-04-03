
import { useState, useEffect } from 'react';
import { Station, Session } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to load and manage station data from Supabase
 */
export const useStationsData = (initialStations: Station[]) => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [sessions, setSessions] = useState<Session[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchStations = async () => {
      try {
        // First check if we already have stations in localStorage (for backward compatibility)
        const storedStations = localStorage.getItem('cuephoriaStations');
        if (storedStations) {
          const parsedStations = JSON.parse(storedStations);
          setStations(parsedStations);
          
          // Migrate localStorage data to Supabase
          for (const station of parsedStations) {
            await supabase.from('stations').upsert(
              {
                id: station.id,
                name: station.name,
                type: station.type,
                hourly_rate: station.hourlyRate,
                is_occupied: station.isOccupied
              },
              { onConflict: 'id' }
            );
          }
          
          // Clear localStorage after migration
          localStorage.removeItem('cuephoriaStations');
          return;
        }
        
        // Fetch stations from Supabase
        const { data, error } = await supabase
          .from('stations')
          .select('*');
          
        if (error) {
          console.error('Error fetching stations:', error);
          toast({
            title: 'Database Error',
            description: 'Failed to fetch stations from database',
            variant: 'destructive'
          });
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
        } else {
          setStations(initialStations);
        }
      } catch (error) {
        console.error('Error in fetchStations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load stations',
          variant: 'destructive'
        });
        // Fallback to initialStations
        setStations(initialStations);
      }
    };
    
    fetchStations();
  }, [initialStations, toast]);
  
  return {
    stations,
    setStations
  };
};
