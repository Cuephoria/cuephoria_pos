
import { useState, useEffect } from 'react';
import { Station, Session } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import React from 'react';

/**
 * Hook to load and manage session data from Supabase
 */
export const useSessionsData = (
  initialStations: Station[],
  setStations: React.Dispatch<React.SetStateAction<Station[]>>
) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // First check if we already have sessions in localStorage (for backward compatibility)
        const storedSessions = localStorage.getItem('cuephoriaSessions');
        if (storedSessions) {
          const parsedSessions = JSON.parse(storedSessions);
          setSessions(parsedSessions);
          
          // Migrate localStorage data to Supabase
          for (const session of parsedSessions) {
            await supabase.from('sessions').upsert(
              {
                id: session.id,
                station_id: session.stationId,
                customer_id: session.customerId,
                start_time: new Date(session.startTime).toISOString(),
                end_time: session.endTime ? new Date(session.endTime).toISOString() : null,
                duration: session.duration
              },
              { onConflict: 'id' }
            );
          }
          
          // Clear localStorage after migration
          localStorage.removeItem('cuephoriaSessions');
          return;
        }
        
        // Fetch sessions from Supabase
        const { data, error } = await supabase
          .from('sessions')
          .select('*');
          
        if (error) {
          console.error('Error fetching sessions:', error);
          toast({
            title: 'Database Error',
            description: 'Failed to fetch sessions from database',
            variant: 'destructive'
          });
          return;
        }
        
        // Transform data to match our Session type
        if (data && data.length > 0) {
          const transformedSessions = data.map(item => ({
            id: item.id,
            stationId: item.station_id,
            customerId: item.customer_id,
            startTime: new Date(item.start_time),
            endTime: item.end_time ? new Date(item.end_time) : undefined,
            duration: item.duration
          }));
          
          setSessions(transformedSessions);
          
          // Update stations with active sessions
          if (transformedSessions.length > 0) {
            const activeSessionsMap = new Map<string, Session>();
            transformedSessions.forEach(session => {
              if (!session.endTime) {
                activeSessionsMap.set(session.stationId, session);
              }
            });
            
            // Fix the type error by using the correct type for React setState
            setStations(prevStations => 
              prevStations.map(station => {
                const activeSession = activeSessionsMap.get(station.id);
                return activeSession
                  ? { ...station, isOccupied: true, currentSession: activeSession }
                  : station;
              })
            );
          }
        }
      } catch (error) {
        console.error('Error in fetchSessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sessions',
          variant: 'destructive'
        });
      }
    };
    
    fetchSessions();
  }, [initialStations, setStations, toast]);
  
  return {
    sessions,
    setSessions
  };
};
