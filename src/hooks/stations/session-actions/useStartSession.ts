
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
      console.log("Starting session for station:", stationId);
      const station = stations.find(s => s.id === stationId);
      if (!station || station.isOccupied) {
        throw new Error("Station not available or already occupied");
      }
      
      const startTime = new Date();
      const sessionId = generateId();
      
      // Create session in Supabase with UUID in the correct format
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
        console.error('Error creating session:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to start session: ' + error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      if (data) {
        const newSession: Session = {
          id: sessionId,
          stationId,
          customerId,
          startTime
        };
        
        // Use function form of setState to prevent stale state issues
        setSessions(prev => [...prev, newSession]);
        
        // Update station state with the correct type
        setStations(prev => prev.map(s => 
          s.id === stationId 
            ? { ...s, isOccupied: true, currentSession: newSession } 
            : s
        ));
        
        // Update station in Supabase
        await supabase
          .from('stations')
          .update({ is_occupied: true })
          .eq('id', stationId);
        
        toast({
          title: 'Success',
          description: 'Session started successfully',
        });
        
        return newSession;
      }
      return undefined;
    } catch (error) {
      console.error('Error in startSession:', error);
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  return { startSession };
};
