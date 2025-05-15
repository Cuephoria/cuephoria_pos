
import { useSessionsData } from './useSessionsData';
import { useStationsData } from './useStationsData';
import { useSessionActions } from './session-actions';
import { Customer, Station, Session, CartItem, SessionResult } from '@/types/pos.types';
import { calculateSessionDuration } from '@/utils/pos.utils';

export const useStations = (initialStations: Station[], updateCustomer: (customer: Customer) => Promise<Customer | null>) => {
  const { 
    stations, 
    setStations,
    deleteStation: deleteStationData,
    updateStation: updateStationData
  } = useStationsData(initialStations);
  
  const {
    sessions,
    setSessions,
    addSession,
    updateSession,
    deleteSession
  } = useSessionsData();
  
  const {
    startSession: startSessionAction,
    endSession: endSessionAction
  } = useSessionActions(
    stations, 
    sessions,
    setStations,
    setSessions,
    addSession,
    updateSession
  );
  
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    try {
      await startSessionAction(stationId, customerId);
    } catch (error) {
      console.error('Error in useStations.startSession:', error);
      throw error;
    }
  };
  
  const endSession = async (stationId: string, customersList: Customer[]): Promise<SessionResult | null> => {
    try {
      // Find the station being ended
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.log('No active session found for this station in useStations');
        return null;
      }
      
      // Get customer info if available
      const customerId = station.currentSession.customerId;
      const customer = customerId ? customersList.find(c => c.id === customerId) : null;
      
      const sessionResult = await endSessionAction(
        stationId,
        station,
        station.currentSession,
        customer,
        updateCustomer
      );
      
      return sessionResult;
    } catch (error) {
      console.error('Error in useStations.endSession:', error);
      throw error;
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
    updateStation
  };
};
