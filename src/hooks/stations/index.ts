
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
    refreshStations
  } = useStationsData(initialStations);
  
  const {
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions
  } = useSessionsData();
  
  const {
    startSession,
    endSession
  } = useSessionActions({
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer
  });

  // Return all hooks combined
  return {
    stations,
    setStations,
    sessions,
    setSessions,
    startSession,
    endSession,
    stationsLoading,
    stationsError,
    sessionsLoading,
    sessionsError,
    refreshStations,
    refreshSessions
  };
};

export { useSessionsData } from './useSessionsData';
export { useStationsData } from './useStationsData';
export { useSessionActions } from './session-actions';
export * from './session-actions';
