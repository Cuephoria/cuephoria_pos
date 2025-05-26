
import { useState, useEffect } from 'react';
import { useStationsData } from './useStationsData';
import { useSessionsData } from './useSessionsData';
import { useSessionActions } from './session-actions';
import { Station, Customer, Session, SessionResult } from '@/types/pos.types';

/**
 * A comprehensive hook that combines station data and session management
 * @param initialStations Optional initial stations array
 * @param updateCustomer Function to update customer information
 */
export const useStations = (
  initialStations: Station[] = [], 
  updateCustomer?: (customer: Customer) => void
) => {
  // Get station data
  const { 
    stations,
    setStations,
    stationsLoading,
    stationsError,
    refreshStations,
    deleteStation,
    updateStation,
    connectSessionsToStations
  } = useStationsData();

  // Get session data
  const {
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions,
    deleteSession
  } = useSessionsData();

  // Connect sessions to stations whenever sessions or stations change
  useEffect(() => {
    if (!stationsLoading && !sessionsLoading && stations.length > 0) {
      console.log("Connecting sessions to stations after data load");
      
      // Connect sessions to stations and update the stations state
      const updatedStations = connectSessionsToStations(stations, sessions);
      if (updatedStations !== stations) {
        setStations(updatedStations);
      }
    }
  }, [sessions, stations, stationsLoading, sessionsLoading]);

  // Create session action props
  const sessionActionsProps = {
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer: updateCustomer || ((customer: Customer) => {})
  };

  // Get session actions
  const {
    startSession,
    endSession,
    isLoading: sessionActionLoading
  } = useSessionActions(sessionActionsProps);

  // Aggregate loading state
  const isLoading = stationsLoading || sessionsLoading || sessionActionLoading;

  return {
    // Station data
    stations,
    setStations,
    stationsLoading,
    stationsError,
    refreshStations,
    
    // Session data
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions,
    
    // Combined loading state
    isLoading,
    
    // Station actions
    deleteStation,
    updateStation,
    
    // Session actions
    startSession,
    endSession,
    deleteSession
  };
};
