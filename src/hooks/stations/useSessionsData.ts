
import { useState, useEffect } from 'react';
import { Station, Session } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to load and manage session data from Supabase
 */
export const useSessionsData = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(false);
  const [sessionsError, setSessionsError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const refreshSessions = async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    
    try {
      // Fetch sessions from Supabase, including active sessions (no end_time)
      const { data, error } = await supabase
        .from('sessions')
        .select('*');
        
      if (error) {
        console.error('Error fetching sessions:', error);
        setSessionsError(new Error(`Failed to fetch sessions: ${error.message}`));
        toast({
          title: 'Database Error',
          description: 'Failed to fetch sessions from database',
          variant: 'destructive'
        });
        return;
      }
      
      // Transform data to match our Session type
      if (data && data.length > 0) {
        const transformedSessions = data.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: item.end_time ? new Date(item.end_time) : undefined,
          duration: item.duration
        }));
        
        // Filter out sessions with end time - this ensures that all sessions
        // (including those from past sessions that weren't properly ended due to page close)
        // are still properly tracked until manually ended
        setSessions(transformedSessions);
        
        // Log active sessions (those without end_time)
        const activeSessions = transformedSessions.filter(s => !s.endTime);
        console.log(`Loaded ${activeSessions.length} active sessions from Supabase`);
        activeSessions.forEach(s => console.log(`- Active session ID: ${s.id}, Station ID: ${s.stationId}`));
      } else {
        console.log("No sessions found in Supabase");
      }
    } catch (error) {
      console.error('Error in fetchSessions:', error);
      setSessionsError(error instanceof Error ? error : new Error('Unknown error fetching sessions'));
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive'
      });
    } finally {
      setSessionsLoading(false);
    }
  };
  
  useEffect(() => {
    refreshSessions();
    
    // Add listener for page visibility changes to refresh sessions when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing sessions...');
        refreshSessions();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return {
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions
  };
};
