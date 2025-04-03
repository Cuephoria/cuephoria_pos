
import { Session, Station, Customer, SessionResult } from '@/types/pos.types';
import { useStartSession } from './useStartSession';
import { useEndSession } from './useEndSession';
import { SessionActionsProps } from './types';
import React from 'react';

/**
 * Hook to provide session management actions
 */
export const useSessionActions = (
  stations: Station[],
  setStations: React.Dispatch<React.SetStateAction<Station[]>>,
  sessions: Session[],
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
  updateCustomer: (customer: Customer) => void
) => {
  const sessionActionsProps: SessionActionsProps = {
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer
  };
  
  const { startSession } = useStartSession(sessionActionsProps);
  const { endSession } = useEndSession(sessionActionsProps);
  
  return {
    startSession,
    endSession
  };
};

// Re-export the hooks for direct access if needed
export { useStartSession } from './useStartSession';
export { useEndSession } from './useEndSession';
export type { SessionActionsProps } from './types';
