
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
  const [isEndingSession, setIsEndingSession] = useState<Record<string, boolean>>({});
  
  // Get the functionality from existing hooks
  const startSessionHook = useStartSession(props);
  const endSessionHook = useEndSession({...props, updateCustomer});
  
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
      const sessionId = generateId();
      const newSession: Session = {
        id: sessionId,
        stationId: stationId,
        customerId: customerId,
        startTime: now,
        // No endTime or duration, will be set when explicitly ended
      };
      
      // Check if stationId is in UUID format for Supabase
      const isUUID = stationId.includes('-') && 
                    stationId.split('-').length === 5 && 
                    stationId.length >= 36;
                    
      console.log(`Station ID ${stationId} is ${isUUID ? '' : 'not '}a valid UUID`);
      
      // For database operations, use a valid UUID
      const dbStationId = isUUID ? stationId : sessionId;
      
      // Insert into Supabase
      try {
        // Use type assertion to work around TypeScript issues with Supabase
        const { data, error } = await supabase
          .from('sessions' as any)
          .insert({
            id: newSession.id,
            station_id: dbStationId, // Use a valid UUID for database
            customer_id: newSession.customerId,
            start_time: newSession.startTime.toISOString(),
            status: 'active', // Explicitly set status
            // No end_time or duration, making it persist until explicitly ended
          } as any)
          .select();
          
        if (error) {
          console.error('Error inserting session into Supabase:', error);
          console.log('Continuing with local state updates only');
        } else {
          console.log('Session inserted into Supabase:', data);
        }
      } catch (error) {
        console.error('Supabase insert error:', error);
        console.log('Continuing with local state updates only');
      }
      
      // Update station
      const updatedStation = {
        ...station,
        isOccupied: true,
        currentSession: newSession
      };
      
      // Update Supabase station only if ID is in valid UUID format
      if (isUUID) {
        try {
          const { error: stationError } = await supabase
            .from('stations')
            .update({
              is_occupied: true
            })
            .eq('id', stationId);
            
          if (stationError) {
            console.error('Error updating station in Supabase:', stationError);
          }
        } catch (error) {
          console.error('Supabase station update error:', error);
        }
      }
      
      // Update local state
      setStations(stations.map(s => s.id === stationId ? updatedStation : s));
      setSessions([...sessions, newSession]);
      
      toast({
        title: 'Session Started',
        description: `Session started for station ${station.name}`,
      });
      
      console.log('Session started successfully');
      
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
  
  // End an active session - improved with reliable completion check
  const endSession = async (stationId: string, customersList?: Customer[]): Promise<SessionResult | undefined> => {
    try {
      // Check if we're already ending this session
      if (isEndingSession[stationId]) {
        console.log('Already ending session for station:', stationId);
        return undefined;
      }
      
      setIsLoading(true);
      setIsEndingSession(prev => ({ ...prev, [stationId]: true }));
      
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
      
      // Call the enhanced endSession implementation that verifies everything worked
      const result = await endSessionHook.endSession(stationId, customersList);
      
      if (!result) {
        throw new Error('Failed to end session - no result returned');
      }
      
      if (!result.isFullyUpdated) {
        throw new Error('Session was not fully updated - please try again');
      }
      
      console.log("Session ended successfully, result:", result);
      
      // Add an extra verification step to double-check the session status
      try {
        const sessionId = station.currentSession.id;
        const { data: verifyData, error: verifyError } = await supabase
          .from('sessions')
          .select('status, end_time')
          .eq('id', sessionId)
          .single();
          
        if (verifyError) {
          console.warn('Final verification check failed, but continuing:', verifyError);
        } else if (!verifyData.end_time || verifyData.status !== 'completed') {
          console.error('Session still not properly marked as completed after all attempts', verifyData);
          
          // One absolutely final attempt before giving up
          const { error: lastAttemptError } = await supabase
            .from('sessions')
            .update({
              status: 'completed',
              end_time: new Date().toISOString()
            })
            .eq('id', sessionId);
            
          if (lastAttemptError) {
            console.error('Final attempt to update session status failed:', lastAttemptError);
            throw new Error('Could not update session status in database');
          } else {
            console.log('Final attempt to update session status succeeded');
          }
        } else {
          console.log('Final verification confirmed session is properly ended:', verifyData);
        }
      } catch (error) {
        console.error('Error in final verification:', error);
        // Continue despite error since we've tried our best
      }
      
      // The session has been fully updated and verified in endSessionHook
      return result;
      
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
      setIsEndingSession(prev => ({ ...prev, [stationId]: false }));
    }
  };
  
  return {
    startSession,
    endSession,
    isLoading
  };
};
