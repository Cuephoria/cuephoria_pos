
import { useState, useEffect, useCallback } from 'react';
import { Station, Session, Customer } from '@/types/pos.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSessionActions } from './session-actions';

export const useStationsData = (initialSessions = [], updateCustomer = (c: Customer) => {}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState<Error | null>(null);
  
  const sessionActionsProps = {
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer
  };
  
  const { startSession, endSession } = useSessionActions(sessionActionsProps);
  
  // Fetch stations from Supabase
  const fetchStations = useCallback(async () => {
    try {
      setStationsLoading(true);
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');
        
      if (error) {
        throw new Error(`Error fetching stations: ${error.message}`);
      }
      
      // Map the stations to the correct format
      const mappedStations = data.map((station) => ({
        id: station.id,
        name: station.name,
        type: station.type,
        hourlyRate: station.hourly_rate,
        isOccupied: station.is_occupied || false,
        currentSession: null // Will be populated later if there is an active session
      }));
      
      console.log('Loaded stations from Supabase:', mappedStations);
      
      // Set the stations in state
      setStations(mappedStations);
      
      // Get active sessions for the stations
      await fetchActiveSessions(mappedStations);
      
      setStationsLoading(false);
    } catch (error) {
      console.error('Error in fetchStations:', error);
      setStationsError(error instanceof Error ? error : new Error('Unknown error in fetchStations'));
      setStationsLoading(false);
      toast.error('Failed to load stations');
    }
  }, []);
  
  // Fetch active sessions for stations
  const fetchActiveSessions = async (stationList: Station[]) => {
    try {
      const { data: activeSessions, error } = await supabase
        .from('sessions')
        .select('*')
        .is('end_time', null);
        
      if (error) {
        console.error('Error fetching active sessions:', error);
        return;
      }
      
      if (!activeSessions || activeSessions.length === 0) {
        return;
      }
      
      console.log('Active sessions found:', activeSessions);
      
      // Create session objects
      const sessionObjects = activeSessions.map(session => ({
        id: session.id,
        stationId: session.station_id,
        customerId: session.customer_id,
        startTime: new Date(session.start_time),
        // No end time or duration for active sessions
      }));
      
      // Update sessions state
      setSessions(prev => [...prev, ...sessionObjects]);
      
      // Update station objects with active sessions
      const updatedStations = stationList.map(station => {
        const activeSession = sessionObjects.find(s => s.stationId === station.id);
        if (activeSession) {
          return {
            ...station,
            isOccupied: true,
            currentSession: activeSession
          };
        }
        return station;
      });
      
      // Update stations state with sessions
      setStations(updatedStations);
      
    } catch (error) {
      console.error('Error in fetchActiveSessions:', error);
    }
  };
  
  // Delete a station
  const deleteStation = async (stationId: string): Promise<boolean> => {
    try {
      const station = stations.find(s => s.id === stationId);
      
      if (!station) {
        toast.error('Station not found');
        return false;
      }
      
      if (station.isOccupied) {
        toast.error('Cannot delete an occupied station');
        return false;
      }
      
      // Delete from Supabase if it has a UUID format
      if (stationId.includes('-')) {
        const { error } = await supabase
          .from('stations')
          .delete()
          .eq('id', stationId);
          
        if (error) {
          console.error('Error deleting station from Supabase:', error);
          toast.error('Failed to delete station from database');
          return false;
        }
      }
      
      // Update local state
      setStations(prevStations => 
        prevStations.filter(s => s.id !== stationId)
      );
      
      toast.success(`Station ${station.name} deleted successfully`);
      return true;
      
    } catch (error) {
      console.error('Error in deleteStation:', error);
      toast.error('An error occurred while deleting the station');
      return false;
    }
  };
  
  // Update a station
  const updateStation = async (
    stationId: string, 
    name: string, 
    hourlyRate: number
  ): Promise<boolean> => {
    try {
      const station = stations.find(s => s.id === stationId);
      
      if (!station) {
        toast.error('Station not found');
        return false;
      }
      
      // Update in Supabase if it has a UUID format
      if (stationId.includes('-')) {
        const { error } = await supabase
          .from('stations')
          .update({
            name,
            hourly_rate: hourlyRate
          })
          .eq('id', stationId);
          
        if (error) {
          console.error('Error updating station in Supabase:', error);
          toast.error('Failed to update station in database');
          return false;
        }
      }
      
      // Update local state
      setStations(prevStations => 
        prevStations.map(s => 
          s.id === stationId 
            ? { ...s, name, hourlyRate } 
            : s
        )
      );
      
      toast.success(`Station ${name} updated successfully`);
      return true;
      
    } catch (error) {
      console.error('Error in updateStation:', error);
      toast.error('An error occurred while updating the station');
      return false;
    }
  };
  
  // Load stations when the component mounts
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);
  
  return {
    stations,
    setStations,
    sessions,
    setSessions,
    startSession,
    endSession,
    stationsLoading,
    stationsError,
    refreshStations: fetchStations,
    deleteStation,
    updateStation,
  };
};
