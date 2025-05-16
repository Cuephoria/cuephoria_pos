import { useState, useEffect } from 'react';
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
  
  const refreshSessions = async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    
    try {
      // Optimize query by selecting only necessary fields
      const { data, error } = await supabase
        .from('sessions')
        .select('id, station_id, customer_id, start_time, end_time, duration')
        .order('start_time', { ascending: false });
        
      if (error) {
        console.error('Error fetching sessions:', error);
        setSessionsError(new Error(`Failed to fetch sessions: ${error.message}`));
        toast.error('Database Error', {
          description: 'Failed to fetch sessions from database',
          duration: 4000
        });
        return;
      }
      
      // Transform data to match our Session type
      if (data && data.length > 0) {
        // Use type assertion to handle TypeScript issues
        const sessionsData = data as any[];
        
        // Transform data in a more optimized way using map
        const transformedSessions = sessionsData.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: item.end_time ? new Date(item.end_time) : undefined,
          duration: item.duration
        }));
        
        console.log(`Loaded ${transformedSessions.length} sessions (optimized query)`);
        setSessions(transformedSessions);
      } else {
        console.log("No sessions found in Supabase");
        setSessions([]);
      }
    } catch (error) {
      console.error('Error in fetchSessions:', error);
      setSessionsError(error instanceof Error ? error : new Error('Unknown error fetching sessions'));
      toast.error('Error', {
        description: 'Failed to load sessions',
        duration: 4000
      });
    } finally {
      setSessionsLoading(false);
    }
  };
  
  // Delete session functionality
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
      
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete session',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSessionsLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('Initial session load triggered');
    refreshSessions();
    
    // Add listener for page visibility changes to refresh sessions when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing sessions...');
        refreshSessions();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up a regular polling interval with a longer interval to reduce server load
    const intervalId = setInterval(() => {
      console.log('Periodic session refresh');
      refreshSessions();
    }, 120000); // Refresh every 2 minutes instead of 1 minute
    
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
