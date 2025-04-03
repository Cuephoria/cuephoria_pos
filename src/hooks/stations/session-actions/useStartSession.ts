
import { Session, Station } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { SessionActionsProps } from './types';
import React from 'react';
import { generateId } from '@/utils/pos.utils';

/**
 * Hook to provide session start functionality
 */
export const useStartSession = ({
  stations,
  setStations,
  sessions,
  setSessions
}: SessionActionsProps) => {
  const { toast } = useToast();
  
  /**
   * Start a new session for a station
   */
  const startSession = async (stationId: string, customerId: string): Promise<Session | undefined> => {
    try {
      console.log("Starting session for station:", stationId, "for customer:", customerId);
      const station = stations.find(s => s.id === stationId);
      if (!station || station.isOccupied) {
        console.error("Station not available or already occupied");
        toast({
          title: "Station Error",
          description: "Station not available or already occupied",
          variant: "destructive"
        });
        throw new Error("Station not available or already occupied");
      }
      
      const startTime = new Date();
      const sessionId = generateId();
      console.log("Generated session ID:", sessionId);
      
      // Create session in Supabase - ensure all IDs are proper UUIDs
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          station_id: stationId,
          customer_id: customerId,
          start_time: startTime.toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating session in Supabase:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to start session: ' + error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      console.log("Session created in Supabase:", data);
      
      // Create session object for local state
      const newSession: Session = {
        id: sessionId,
        stationId,
        customerId,
        startTime
      };
      
      // Update local state
      console.log("Updating sessions state with new session");
      setSessions(prev => [...prev, newSession]);
      
      // Update station state
      console.log("Updating stations state to mark station as occupied");
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, isOccupied: true, currentSession: newSession } 
          : s
      ));
      
      // Update station in Supabase
      console.log("Updating station in Supabase to mark as occupied");
      const { error: stationError } = await supabase
        .from('stations')
        .update({ is_occupied: true })
        .eq('id', stationId);
      
      if (stationError) {
        console.error('Error updating station in Supabase:', stationError);
        // Don't throw, as the session was already created
      }
      
      toast({
        title: 'Success',
        description: 'Session started successfully',
      });
      
      return newSession;
    } catch (error) {
      console.error('Error in startSession:', error);
      toast({
        title: 'Error',
        description: 'Failed to start session: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive'
      });
      return undefined; // Return undefined instead of throwing to prevent further errors
    }
  };
  
  return { startSession };
};
