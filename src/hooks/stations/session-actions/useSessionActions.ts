
import { useState } from 'react';
import { useStartSession } from './useStartSession';
import { useEndSession } from './useEndSession';
import { SessionActionsProps } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, SessionResult, Customer } from '@/types/pos.types';

export const useSessionActions = (props: SessionActionsProps) => {
  const { stations, setStations, sessions, setSessions, updateCustomer } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the functionality from existing hooks
  const { startSession: startSessionBase } = useStartSession(props);
  const { endSession: endSessionBase } = useEndSession({...props, updateCustomer});
  
  // Start a new session
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Starting session for station:', stationId, 'customer:', customerId);
      
      const result = await startSessionBase(stationId, customerId);
      if (!result) {
        throw new Error("Failed to start session");
      }
      
      console.log('Session started successfully with ID:', result.id);
      
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
      const result = await endSessionBase(stationId, customersList);
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
  
  return {
    startSession,
    endSession,
    isLoading
  };
};
