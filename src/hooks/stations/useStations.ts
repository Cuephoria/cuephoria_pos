
import { useState, useEffect } from 'react';
import { Station, Session, SessionResult, Customer } from '@/types/pos.types';
import { useSessionActions } from './session-actions/useSessionActions';
import { useStationsData } from './useStationsData';
import { useSessionsData } from './useSessionsData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStations = (initialStations: Station[] = [], updateCustomer: (customer: Customer) => void) => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  const { toast } = useToast();
  
  // Fetch stations and sessions data
  const { fetchStations, fetchStationsError } = useStationsData();
  const { fetchSessions, fetchSessionsError } = useSessionsData();
  
  // Get session actions (start, end)
  const sessionActions = useSessionActions({
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer
  });
  
  // Initialize stations and sessions
  useEffect(() => {
    const loadStationData = async () => {
      try {
        const fetchedStations = await fetchStations();
        setStations(fetchedStations);
        
        const fetchedSessions = await fetchSessions();
        setSessions(fetchedSessions);
        
        console.log('Loaded stations:', fetchedStations.length);
        console.log('Loaded sessions:', fetchedSessions.length);
      } catch (error) {
        console.error('Error loading stations or sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load stations or sessions',
          variant: 'destructive'
        });
      }
    };
    
    loadStationData();
  }, []);
  
  // Function to start a session
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    await sessionActions.startSession(stationId, customerId);
  };
  
  // Function to end a session
  const endSession = async (stationId: string): Promise<SessionResult | undefined> => {
    return await sessionActions.endSession(stationId);
  };
  
  // Update a station
  const updateStation = async (stationId: string, name: string, hourlyRate: number): Promise<boolean> => {
    try {
      const station = stations.find(s => s.id === stationId);
      if (!station) {
        toast({
          title: 'Error',
          description: 'Station not found',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update station locally first
      const updatedStation = { ...station, name, hourlyRate };
      setStations(prev => prev.map(s => s.id === stationId ? updatedStation : s));
      
      // Update in Supabase if it's a valid UUID
      if (stationId.includes('-')) {
        const { error } = await supabase
          .from('stations')
          .update({
            name: name,
            hourly_rate: hourlyRate
          })
          .eq('id', stationId);
        
        if (error) {
          console.error('Error updating station in database:', error);
          // Revert local change
          setStations(prev => prev.map(s => s.id === stationId ? station : s));
          toast({
            title: 'Error',
            description: 'Failed to update station in database',
            variant: 'destructive'
          });
          return false;
        }
      }
      
      toast({
        title: 'Success',
        description: 'Station updated successfully',
      });
      return true;
    } catch (error) {
      console.error('Error in updateStation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update station',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Delete a station
  const deleteStation = async (stationId: string): Promise<boolean> => {
    try {
      // Check if station is occupied
      const station = stations.find(s => s.id === stationId);
      if (!station) {
        toast({
          title: 'Error',
          description: 'Station not found',
          variant: 'destructive'
        });
        return false;
      }
      
      if (station.isOccupied) {
        toast({
          title: 'Error',
          description: 'Cannot delete an occupied station',
          variant: 'destructive'
        });
        return false;
      }
      
      // Check for active sessions
      const hasActiveSessions = sessions.some(s => 
        s.stationId === stationId && !s.endTime
      );
      
      if (hasActiveSessions) {
        toast({
          title: 'Error',
          description: 'Cannot delete a station with active sessions',
          variant: 'destructive'
        });
        return false;
      }
      
      // Delete station locally first
      setStations(prev => prev.filter(s => s.id !== stationId));
      
      // Delete from Supabase if it's a valid UUID
      if (stationId.includes('-')) {
        const { error } = await supabase
          .from('stations')
          .delete()
          .eq('id', stationId);
        
        if (error) {
          console.error('Error deleting station from database:', error);
          // Restore the station locally
          setStations(prev => [...prev, station]);
          toast({
            title: 'Error',
            description: 'Failed to delete station from database',
            variant: 'destructive'
          });
          return false;
        }
      }
      
      toast({
        title: 'Success',
        description: 'Station deleted successfully',
      });
      return true;
    } catch (error) {
      console.error('Error in deleteStation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete station',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  return {
    stations,
    setStations,
    sessions,
    setSessions,
    startSession,
    endSession,
    updateStation,
    deleteStation
  };
};
