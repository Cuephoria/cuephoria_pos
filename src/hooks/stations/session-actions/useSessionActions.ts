
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
        // Use type assertion to work around TypeScript issues with Supabase
        const { data, error } = await supabase
          .from('sessions' as any)
          .insert({
            id: newSession.id,
            station_id: dbStationId, // Use a valid UUID for database
            customer_id: newSession.customerId,
            start_time: newSession.startTime.toISOString(),
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
  
  // End an active session
  const endSession = async (stationId: string, customersList?: Customer[]): Promise<void> => {
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
      await endSessionHook.endSession(stationId, customersList);
      console.log("Session ended successfully");
      
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
  
  // Add a new station
  const addStation = async (station: Omit<Station, "id" | "isOccupied" | "createdAt">): Promise<Station | undefined> => {
    try {
      const { name, type, hourlyRate } = station;
      
      // Create a new station object
      const newStation: Station = {
        id: generateId(),
        name,
        type,
        hourlyRate,
        isOccupied: false,
        currentSession: null,
        createdAt: new Date()
      };
      
      // Insert into Supabase
      try {
        const { data, error } = await supabase
          .from('stations')
          .insert({
            name: newStation.name,
            type: newStation.type,
            hourly_rate: newStation.hourlyRate,
            is_occupied: false
          })
          .select();
          
        if (error) {
          console.error('Error inserting station into Supabase:', error);
        } else if (data && data[0]) {
          // Use the ID from Supabase
          newStation.id = data[0].id;
          console.log('Station inserted into Supabase:', data);
        }
      } catch (error) {
        console.error('Supabase station insert error:', error);
      }
      
      // Update local state
      setStations(prevStations => [...prevStations, newStation]);
      
      toast({
        title: 'Station Added',
        description: `Station ${newStation.name} has been added`,
      });
      
      return newStation;
      
    } catch (error) {
      console.error('Error in addStation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add station',
        variant: 'destructive'
      });
      return undefined;
    }
  };
  
  // Update an existing station
  const updateStation = async (station: Station): Promise<Station | undefined> => {
    try {
      // Update in Supabase
      try {
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
          console.error('Error updating station in Supabase:', error);
        }
      } catch (error) {
        console.error('Supabase station update error:', error);
      }
      
      // Update local state
      setStations(prevStations => 
        prevStations.map(s => s.id === station.id ? station : s)
      );
      
      toast({
        title: 'Station Updated',
        description: `Station ${station.name} has been updated`,
      });
      
      return station;
      
    } catch (error) {
      console.error('Error in updateStation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update station',
        variant: 'destructive'
      });
      return undefined;
    }
  };
  
  // Delete a station
  const deleteStation = async (id: string): Promise<void> => {
    try {
      // Delete from Supabase
      try {
        const { error } = await supabase
          .from('stations')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Error deleting station from Supabase:', error);
        }
      } catch (error) {
        console.error('Supabase station delete error:', error);
      }
      
      // Update local state
      setStations(prevStations => prevStations.filter(s => s.id !== id));
      
      toast({
        title: 'Station Deleted',
        description: 'The station has been deleted',
      });
      
    } catch (error) {
      console.error('Error in deleteStation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete station',
        variant: 'destructive'
      });
    }
  };
  
  // Add placeholder functions for pause and resume
  const pauseSession = async (id: string): Promise<void> => {
    console.log('Pause session requested for:', id);
    // Implement later
  };
  
  const resumeSession = async (id: string): Promise<void> => {
    console.log('Resume session requested for:', id);
    // Implement later
  };
  
  // Return all the functions
  return {
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    addStation,
    updateStation,
    deleteStation,
    isLoading
  };
};
