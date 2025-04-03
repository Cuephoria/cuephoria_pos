
// This file exports the useStations hook
import { useSessionsData } from './useSessionsData';
import { useStationsData } from './useStationsData';
import { useSessionActions } from './session-actions';
import { Station, Session, Customer, SessionResult } from '@/types/pos.types';
import { useState, useEffect } from 'react';

export const useStations = (initialStations: Station[], updateCustomer: (customer: Customer) => void) => {
  const { 
    stations, 
    setStations,
    stationsLoading,
    stationsError,
    refreshStations,
    deleteStation
  } = useStationsData();
  
  const {
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions: refreshSessionsFromData,
    deleteSession
  } = useSessionsData();
  
  // Connect active sessions to stations
  useEffect(() => {
    if (sessions.length > 0 && stations.length > 0) {
      console.log("Connecting active sessions to stations");
      
      // Find active sessions (without endTime)
      const activeSessions = sessions.filter(s => !s.endTime);
      
      if (activeSessions.length > 0) {
        console.log(`Found ${activeSessions.length} active sessions to connect`);
        
        // Create a mapping of station ID to session
        const activeSessionMap = new Map<string, Session>();
        activeSessions.forEach(session => {
          activeSessionMap.set(session.stationId, session);
        });
        
        // Update stations with their active sessions
        setStations(prev => prev.map(station => {
          const activeSession = activeSessionMap.get(station.id);
          if (activeSession) {
            console.log(`Connecting session to station ${station.name}`);
            return {
              ...station,
              isOccupied: true,
              currentSession: activeSession
            };
          }
          return {
            ...station,
            isOccupied: false,
            currentSession: null
          };
        }));
      } else {
        // If there are no active sessions, make sure all stations are marked as unoccupied
        console.log("No active sessions found, ensuring all stations are marked as unoccupied");
        setStations(prev => prev.map(station => ({
          ...station,
          isOccupied: false,
          currentSession: null
        })));
      }
    }
  }, [sessions, stations.length]);
  
  const {
    startSession,
    endSession,
    isLoading
  } = useSessionActions({
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer
  });

  // Wrap the refreshSessions function to ensure it's properly defined
  const refreshSessions = async (): Promise<void> => {
    console.log("refreshSessions called from useStations");
    return await refreshSessionsFromData();
  };

  // Return all hooks combined
  return {
    stations,
    setStations,
    sessions,
    setSessions,
    startSession,
    endSession,
    deleteSession,
    refreshSessions,
    deleteStation,
    stationsLoading,
    stationsError,
    sessionsLoading,
    sessionsError,
    refreshStations,
    isLoading
  };
};

export { useSessionsData } from './useSessionsData';
export { useStationsData } from './useStationsData';
export { useSessionActions } from './session-actions';
