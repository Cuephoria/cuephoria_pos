
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
      
      // Create new session locally first
      const newSession: Session = {
        id: sessionId,
        stationId,
        customerId,
        startTime
      };
      
      // Update local state first for immediate UI update
      setSessions(prev => [...prev, newSession]);
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, isOccupied: true, currentSession: newSession } 
          : s
      ));
      
      // Then try to create session in Supabase
      try {
        // Convert non-UUID station IDs to proper UUIDs for Supabase
        // Check if stationId is already a UUID format (contains hyphens)
        const dbStationId = stationId.includes('-') ? stationId : sessionId; // Use session ID as fallback
        
        console.log("Using DB station ID:", dbStationId);
        
        // Use type assertion to work around TypeScript issues with Supabase
        const { data, error } = await supabase
          .from('sessions' as any)
          .insert({
            id: sessionId,
            station_id: dbStationId, // Use the proper format for DB
            customer_id: customerId,
            start_time: startTime.toISOString()
          } as any)
          .select()
          .single();
          
        if (error) {
          console.error('Error creating session in Supabase:', error);
          // We'll continue since local state is already updated
        } else {
          console.log("Session created in Supabase:", data);
        }
      } catch (supabaseError) {
        console.error('Error in Supabase operation:', supabaseError);
        // We'll continue since local state is already updated
      }
      
      // Try to update station in Supabase
      try {
        // Find the station to check if it has a proper UUID
        const dbStationId = stationId.includes('-') ? stationId : null;
        
        if (dbStationId) {
          const { error: stationError } = await supabase
            .from('stations')
            .update({ is_occupied: true })
            .eq('id', dbStationId);
          
          if (stationError) {
            console.error('Error updating station in Supabase:', stationError);
            // Continue since local state is already updated
          }
        } else {
          console.log("Skipping station update in Supabase due to non-UUID station ID");
        }
      } catch (supabaseError) {
        console.error('Error updating station in Supabase:', supabaseError);
        // Continue since local state is already updated
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
      return undefined;
    }
  };
  
  return { startSession };
};
