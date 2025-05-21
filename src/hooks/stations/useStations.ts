
import { useState } from 'react';
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
    updateStation
  } = useStationsData(); // Remove the initialStations parameter since the function doesn't accept it

  // Get session data
  const {
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions,
    deleteSession
  } = useSessionsData();

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
