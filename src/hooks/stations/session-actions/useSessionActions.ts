
import { useState } from 'react';
import { useStartSession } from './useStartSession';
import { useEndSession } from './useEndSession';
import { SessionActionsProps } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';
import { Session, SessionResult, Customer } from '@/types/pos.types';

export const useSessionActions = (props: SessionActionsProps) => {
  const { stations, setStations, sessions, setSessions, updateCustomer } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the functionality from existing hooks
  const startSessionHook = useStartSession(props);
  const endSessionHook = useEndSession(props);
  
  // Start a new session
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Starting session for station:', stationId, 'customer:', customerId);
      
      // Find the station
      const station = stations.find(s => s.id === stationId);
      if (!station) {
        console.error('Station not found:', stationId);
        throw new Error('Station not found');
      }
      
      if (station.isOccupied) {
        console.error('Station is already occupied:', stationId);
        throw new Error('Station is already occupied');
      }
      
      // Create a new session
      const now = new Date();
      const newSession: Session = {
        id: generateId(),
        stationId: stationId,
        customerId: customerId,
        startTime: now,
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          id: newSession.id,
          station_id: newSession.stationId,
          customer_id: newSession.customerId,
          start_time: newSession.startTime.toISOString(),
        })
        .select();
        
      if (error) {
        console.error('Error inserting session into Supabase:', error);
        throw error;
      }
      
      console.log('Session inserted into Supabase:', data);
      
      // Update station
      const updatedStation = {
        ...station,
        isOccupied: true,
        currentSession: newSession
      };
      
      // Update Supabase station
      const { error: stationError } = await supabase
        .from('stations')
        .update({
          is_occupied: true
        })
        .eq('id', stationId);
        
      if (stationError) {
        console.error('Error updating station in Supabase:', stationError);
        // Try to roll back session
        await supabase.from('sessions').delete().eq('id', newSession.id);
        throw stationError;
      }
      
      // Update local state
      setStations(stations.map(s => s.id === stationId ? updatedStation : s));
      setSessions([...sessions, newSession]);
      
      toast({
        title: 'Session Started',
        description: `Session started for station ${station.name}`,
      });
      
      console.log('Session started successfully');
      
      // Also call the original hook implementation for backward compatibility
      await startSessionHook.startSession(stationId, customerId);
      
    } catch (error) {
      console.error('Error in startSession:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start session',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // End an active session
  const endSession = async (stationId: string): Promise<SessionResult> => {
    try {
      setIsLoading(true);
      console.log('Ending session for station:', stationId);
      
      // Find the station
      const station = stations.find(s => s.id === stationId);
      if (!station) {
        console.error('Station not found:', stationId);
        throw new Error('Station not found');
      }
      
      if (!station.isOccupied || !station.currentSession) {
        console.error('No active session found for this station:', stationId);
        throw new Error('No active session found');
      }
      
      // Calculate session duration
      const now = new Date();
      const startTime = new Date(station.currentSession.startTime);
      const durationMs = now.getTime() - startTime.getTime();
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      
      // Update the session with end time and duration
      const updatedSession: Session = {
        ...station.currentSession,
        endTime: now,
        duration: durationMinutes
      };
      
      // Update Supabase
      const { error } = await supabase
        .from('sessions')
        .update({
          end_time: updatedSession.endTime.toISOString(),
          duration: updatedSession.duration
        })
        .eq('id', updatedSession.id);
        
      if (error) {
        console.error('Error updating session in Supabase:', error);
        throw error;
      }
      
      // Update station
      const updatedStation = {
        ...station,
        isOccupied: false,
        currentSession: null
      };
      
      // Update Supabase station
      const { error: stationError } = await supabase
        .from('stations')
        .update({
          is_occupied: false
        })
        .eq('id', stationId);
        
      if (stationError) {
        console.error('Error updating station in Supabase:', stationError);
        throw stationError;
      }
      
      // Update local state
      setStations(stations.map(s => s.id === stationId ? updatedStation : s));
      setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
      
      // Calculate pricing based on hourly rate and duration
      const hoursPlayed = durationMinutes / 60;
      const sessionCost = Math.ceil(hoursPlayed * station.hourlyRate);
      
      // Create cart item for the session
      const sessionCartItem = {
        id: updatedSession.id,
        type: 'session',
        name: `${station.name} (${hoursPlayed.toFixed(1)} hours)`,
        price: sessionCost,
        quantity: 1,
        total: sessionCost
      };
      
      toast({
        title: 'Session Ended',
        description: `Session ended for station ${station.name}`,
      });
      
      console.log('Session ended successfully, cart item:', sessionCartItem);
      
      // Also call the original hook implementation for backward compatibility
      const originalResult = await endSessionHook.endSession(stationId);
      
      return {
        updatedSession,
        sessionCartItem,
        customer: originalResult?.customer
      };
      
    } catch (error) {
      console.error('Error in endSession:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to end session',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    startSession,
    endSession,
    isLoading
  };
};
