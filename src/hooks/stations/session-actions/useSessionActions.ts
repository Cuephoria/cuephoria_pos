import { useState } from 'react';
import { useStartSession } from './useStartSession';
import { useEndSession } from './useEndSession';
import { SessionActionsProps } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';
import { Session, SessionResult, Customer } from '@/types/pos.types';
import { isMembershipActive } from '@/utils/membership.utils';

export const useSessionActions = (props: SessionActionsProps) => {
  const { stations, setStations, sessions, setSessions, updateCustomer } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
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
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            id: newSession.id,
            station_id: dbStationId, // Use a valid UUID for database
            customer_id: newSession.customerId,
            start_time: newSession.startTime.toISOString(),
            // No end_time or duration, making it persist until explicitly ended
          })
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
  
  // End an active session
  const endSession = async (stationId: string, customersList?: Customer[]): Promise<SessionResult | undefined> => {
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
      
      // Call the original hook implementation to handle session ending
      const result = await endSessionHook.endSession(stationId, customersList);
      console.log("Session ended successfully, result:", result);
      
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
    }
  };
  
  // Delete a session and restore membership hours if applicable
  const deleteSession = async (sessionId: string, customersList?: Customer[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Deleting session:', sessionId);
      
      // Find the session
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        console.error('Session not found:', sessionId);
        throw new Error('Session not found');
      }
      
      // Find the customer
      const customer = customersList?.find(c => c.id === session.customerId);
      if (customer && session.duration && customer.isMember) {
        // Restore hours to the customer's membership if they're a member and session was completed
        await endSessionHook.restoreSessionHours(session, customer);
      }
      
      // Delete from Supabase
      try {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('id', sessionId);
          
        if (error) {
          console.error('Error deleting session from Supabase:', error);
        }
      } catch (error) {
        console.error('Supabase delete error:', error);
      }
      
      // Update local state
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      // If the session is active, update the station too
      if (!session.endTime) {
        const stationId = session.stationId;
        const station = stations.find(s => s.id === stationId);
        
        if (station) {
          // Update station
          setStations(stations.map(s => 
            s.id === stationId 
              ? { ...s, isOccupied: false, currentSession: null } 
              : s
          ));
          
          // Update Supabase station
          if (stationId.includes('-')) {
            try {
              const { error } = await supabase
                .from('stations')
                .update({ is_occupied: false })
                .eq('id', stationId);
                
              if (error) {
                console.error('Error updating station in Supabase:', error);
              }
            } catch (error) {
              console.error('Supabase station update error:', error);
            }
          }
        }
      }
      
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete session',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    startSession,
    endSession,
    deleteSession,
    isLoading
  };
};
