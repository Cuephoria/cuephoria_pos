
import { useState } from 'react';
import { Station, Session, Customer, SessionResult } from '@/types/pos.types';
import { useStationsData } from './useStationsData';
import { useSessionsData } from './useSessionsData';
import { useSessionActions } from './useSessionActions';

/**
 * Main stations hook that combines data and actions
 */
export const useStations = (
  initialStations: Station[], 
  updateCustomer: (customer: Customer) => void
) => {
  // Initialize stations data
  const { stations, setStations } = useStationsData(initialStations);
  
  // Initialize sessions data
  const { sessions, setSessions } = useSessionsData(initialStations, setStations);
  
  // Initialize session actions
  const { startSession, endSession } = useSessionActions(
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer
  );
  
  return {
    stations,
    setStations,
    sessions,
    setSessions,
    startSession,
    endSession
  };
};

// Export everything from the internal hooks for direct access if needed
export * from './useStationsData';
export * from './useSessionsData';
export * from './useSessionActions';
