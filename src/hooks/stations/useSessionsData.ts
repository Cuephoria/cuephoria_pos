import { useState, useEffect } from 'react';
import { Session } from '@/types/pos.types';
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
        
        // Keep all sessions, including those with end time, to maintain history
        setSessions(transformedSessions);
        
        // Log active sessions (those without end_time)
        const activeSessions = transformedSessions.filter(s => !s.endTime);
        console.log(`Loaded ${activeSessions.length} active sessions from Supabase`);
        activeSessions.forEach(s => console.log(`- Active session ID: ${s.id}, Station ID: ${s.stationId}`));
      } else {
        console.log("No sessions found in Supabase");
        // Don't clear sessions if no data, as it might be a network issue
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
  
  const deleteSession = async (sessionId: string): Promise<boolean> => {
    setSessionsLoading(true);
    try {
      // First, get the session to check if it's active
      const session = sessions.find(s => s.id === sessionId);
      
      if (!session) {
        toast({
          title: 'Error',
          description: 'Session not found',
          variant: 'destructive'
        });
        return false;
      }
      
      // If the session is active (no endTime), update the station status first
      if (!session.endTime) {
        try {
          const { error: stationError } = await supabase
            .from('stations')
            .update({ is_occupied: false })
            .eq('id', session.stationId);
            
          if (stationError) {
            console.error('Error updating station status:', stationError);
          }
        } catch (error) {
          console.error('Error updating station status:', error);
        }
      }
      
      // Delete the session from Supabase
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error deleting session:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to delete session from database',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
      setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
      
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive'
      });
      return false;
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
    
    // Set up a regular polling interval to refresh sessions even when page is visible
    const intervalId = setInterval(() => {
      console.log('Periodic session refresh');
      refreshSessions();
    }, 60000); // Refresh every minute
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);
  
  return {
    sessions,
    setSessions,
    sessionsLoading,
    sessionsError,
    refreshSessions,
    deleteSession
  };
};
