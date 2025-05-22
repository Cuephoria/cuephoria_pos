
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
  
  // Add auto-refresh for stations every 30 seconds
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      if (!stationsLoading && !sessionsLoading) {
        console.log("Auto-refreshing stations and sessions data");
        refreshStations();
        refreshSessions();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(autoRefreshInterval);
  }, [refreshStations, refreshSessions, stationsLoading, sessionsLoading]);

  // Add a listener for redirect-based refreshes
  useEffect(() => {
    // Check if coming back from POS page (after ending a session)
    const checkPageTransition = () => {
      const prevRoute = sessionStorage.getItem('prevRoute');
      const currentRoute = window.location.pathname;
      
      // If just returned from POS route to stations route
      if (prevRoute === '/pos' && currentRoute === '/stations') {
        console.log("Detected navigation from POS to Stations - refreshing data");
        if (!stationsLoading && !sessionsLoading) {
          // Subtle refresh after a short delay to let page render
          setTimeout(() => {
            refreshStations();
            refreshSessions();
          }, 300);
        }
      }
      
      // Update previous route
      sessionStorage.setItem('prevRoute', currentRoute);
    };
    
    // Run on component mount
    checkPageTransition();
    
    // Add event listener for custom refresh event
    const handleCustomRefresh = () => {
      if (!stationsLoading && !sessionsLoading) {
        console.log("Custom refresh event received");
        refreshStations();
        refreshSessions();
      }
    };
    
    window.addEventListener('refresh-stations', handleCustomRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('refresh-stations', handleCustomRefresh);
    };
  }, [refreshStations, refreshSessions, stationsLoading, sessionsLoading]);

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
