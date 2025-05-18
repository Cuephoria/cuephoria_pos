
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@/types/pos.types';
import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import { toast } from 'sonner';

/**
 * Hook to load and manage session data from Supabase
 */
export const useSessionsData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(false);
  const [sessionsError, setSessionsError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  
  const refreshSessions = useCallback(async () => {
    // If we've fetched data recently, don't fetch again
    if (lastFetched && (new Date().getTime() - lastFetched.getTime() < 30000)) {
      console.log('Using cached sessions data from the last 30 seconds');
      return;
    }
    
    setSessionsLoading(true);
    setSessionsError(null);
    
    try {
      console.time('sessionsFetch');
      // First query only active sessions for immediate display
      const { data: activeSessions, error: activeSessionsError } = await supabase
        .from('sessions')
        .select('id, station_id, customer_id, start_time, end_time, duration')
        .is('end_time', null);
      
      if (activeSessionsError) {
        throw new Error(`Failed to fetch active sessions: ${activeSessionsError.message}`);
      }
      
      // Transform active sessions and update state immediately for better UX
      if (activeSessions && activeSessions.length > 0) {
        const transformedActiveSessions = activeSessions.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: undefined,
          duration: item.duration
        }));
        
        console.log(`Loaded ${transformedActiveSessions.length} active sessions from Supabase`);
        setSessions(transformedActiveSessions);
        
        transformedActiveSessions.forEach(s => console.log(`- Active session ID: ${s.id}, Station ID: ${s.stationId}`));
      }
      
      // Then fetch recent completed sessions in the background (last 7 days only)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentSessions, error: recentSessionsError } = await supabase
        .from('sessions')
        .select('id, station_id, customer_id, start_time, end_time, duration')
        .not('end_time', 'is', null)
        .gte('end_time', sevenDaysAgo.toISOString())
        .order('end_time', { ascending: false })
        .limit(100); // Limit to most recent 100 completed sessions
      
      if (recentSessionsError) {
        throw new Error(`Failed to fetch recent sessions: ${recentSessionsError.message}`);
      }
      
      // Transform and combine with active sessions
      if (recentSessions && recentSessions.length > 0) {
        const transformedRecentSessions = recentSessions.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: new Date(item.end_time),
          duration: item.duration
        }));
        
        // Combine active and completed sessions
        const transformedActiveSessions = activeSessions ? activeSessions.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: undefined,
          duration: item.duration
        })) : [];
        
        const allSessions = [
          ...transformedActiveSessions,
          ...transformedRecentSessions
        ];
        
        console.log(`Loaded ${allSessions.length} total sessions from Supabase`);
        setSessions(allSessions);
      }
      
      console.timeEnd('sessionsFetch');
      setLastFetched(new Date());
    } catch (error) {
      console.error('Error in fetchSessions:', error);
      setSessionsError(error instanceof Error ? error : new Error('Unknown error fetching sessions'));
      toast.error('Failed to load sessions', { 
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setSessionsLoading(false);
    }
  }, [lastFetched]);
  
  // Add delete session functionality
  const deleteSession = async (sessionId: string): Promise<boolean> => {
    try {
      setSessionsLoading(true);
      
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
        
      if (error) {
        throw new Error(handleSupabaseError(error, 'delete session'));
      }
      
      // Update local state to remove the deleted session
      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
      
      toast.success('Session deleted successfully');
      
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    } finally {
      setSessionsLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('Initial session load triggered');
    refreshSessions();
    
    // Add listener for page visibility changes with debounce
    let visibilityTimeout: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Clear any existing timeout
        clearTimeout(visibilityTimeout);
        
        // Set a small timeout to prevent multiple rapid refreshes
        visibilityTimeout = setTimeout(() => {
          console.log('Page became visible, refreshing sessions...');
          refreshSessions();
        }, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up a regular polling interval with longer interval
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('Periodic session refresh');
        refreshSessions();
      }
    }, 180000); // Refresh every 3 minutes instead of every minute
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
      clearTimeout(visibilityTimeout);
    };
  }, [refreshSessions]);
  
  return {
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions,
    deleteSession
  };
};
