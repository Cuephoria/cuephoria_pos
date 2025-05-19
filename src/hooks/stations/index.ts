
import { useStationsData } from './useStationsData';
import { useSessionsData } from './useSessionsData';
import { useSessionActions } from './session-actions';
import { Customer } from '@/types/pos.types';

export const useStations = (initialStations = [], updateCustomer?: (customer: Customer) => void) => {
  // Get station data
  const stationsData = useStationsData();
  
  // Get sessions data
  const sessionsData = useSessionsData();
  
  // Get session actions (start/end)
  const sessionActions = useSessionActions({
    stations: stationsData.stations,
    setStations: stationsData.setStations,
    sessions: sessionsData.sessions,
    setSessions: sessionsData.setSessions,
    updateCustomer
  });
  
  // Return combined data and functions
  return {
    // Station data
    stations: stationsData.stations,
    setStations: stationsData.setStations,
    stationsLoading: stationsData.stationsLoading,
    stationsError: stationsData.stationsError,
    refreshStations: stationsData.refreshStations,
    deleteStation: stationsData.deleteStation,
    updateStation: stationsData.updateStation,
    
    // Sessions data
    sessions: sessionsData.sessions,
    setSessions: sessionsData.setSessions,
    sessionsLoading: sessionsData.sessionsLoading,
    refreshSessions: sessionsData.refreshSessions,
    
    // Session actions
    startSession: sessionActions.startSession,
    endSession: sessionActions.endSession
  };
};
