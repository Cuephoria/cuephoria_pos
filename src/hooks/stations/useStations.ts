
import { useSessionsData } from './useSessionsData';
import { useStationsData } from './useStationsData';
import { useSessionActions } from './session-actions';
import { Customer, Station, Session, SessionResult } from '@/types/pos.types';
import { useState } from 'react';

export const useStations = (initialStations: Station[], updateCustomer: (customer: Customer) => void) => {
  const { 
    stations, 
    setStations,
    stationsLoading,
    stationsError,
    refreshStations,
    deleteStation: deleteStationData,
    updateStation: updateStationData
  } = useStationsData();
  
  const {
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions,
    deleteSession
  } = useSessionsData();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Get actions from session-actions hook
  const sessionActions = useSessionActions({
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer
  });
  
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    try {
      setIsLoading(true);
      await sessionActions.startSession(stationId, customerId);
    } catch (error) {
      console.error('Error in useStations.startSession:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const endSession = async (stationId: string, customersList?: Customer[]): Promise<SessionResult | undefined> => {
    try {
      setIsLoading(true);
      
      // Find the station being ended
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.log('No active session found for this station in useStations');
        return undefined;
      }
      
      const result = await sessionActions.endSession(stationId, customersList);
      return result;
      
    } catch (error) {
      console.error('Error in useStations.endSession:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStation = async (stationId: string): Promise<boolean> => {
    try {
      // First check if the station has active sessions
      const station = stations.find(s => s.id === stationId);
      if (station && station.isOccupied) {
        return false; // Can't delete a station with active sessions
      }
      
      // Delete all sessions associated with this station
      const stationSessions = sessions.filter(s => s.stationId === stationId);
      for (const session of stationSessions) {
        await deleteSession(session.id);
      }
      
      // Delete the station
      const success = await deleteStationData(stationId);
      return success;
    } catch (error) {
      console.error('Error in useStations.deleteStation:', error);
      return false;
    }
  };
  
  const updateStation = async (stationId: string, name: string, hourlyRate: number): Promise<boolean> => {
    try {
      const success = await updateStationData(stationId, name, hourlyRate);
      return success;
    } catch (error) {
      console.error('Error in useStations.updateStation:', error);
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
    deleteStation,
    updateStation,
    stationsLoading,
    stationsError,
    sessionsLoading,
    sessionsError,
    refreshStations,
    refreshSessions,
    isLoading
  };
};
