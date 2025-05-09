import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePOS } from '@/context/POSContext';
import { toast } from 'sonner';
import { exportSessionsToCSV } from '@/utils/pos.utils';

export const useSessionsData = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const { customers, stations } = usePOS();
  
  // Create a lookup for station names by ID for better display
  const stationsLookup = stations.reduce((acc, station) => {
    acc[station.id] = station.name;
    return acc;
  }, {} as Record<string, string>);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Failed to fetch sessions');
      } else {
        setSessions(data || []);
      }
    } catch (error) {
      console.error('Error in sessions fetching:', error);
      toast.error('Failed to load sessions data');
    } finally {
      setSessionsLoading(false);
    }
  }, []);
  
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      // First, get the session to check if it's active
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (sessionData && !sessionData.end_time) {
        // If active session, update the station status to not occupied
        await supabase
          .from('stations')
          .update({ is_occupied: false })
          .eq('id', sessionData.station_id);
      }
      
      // Then delete the session
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error deleting session:', error);
        toast.error('Failed to delete session');
        return false;
      } else {
        toast.success('Session deleted successfully');
        // Refresh sessions data
        fetchSessions();
        return true;
      }
    } catch (error) {
      console.error('Error in session deletion:', error);
      toast.error('An error occurred while deleting the session');
      return false;
    }
  }, [fetchSessions]);
  
  // Function to export sessions data
  const exportSessions = useCallback(() => {
    if (sessions.length === 0) {
      toast.error('No sessions data to export');
      return;
    }
    
    try {
      exportSessionsToCSV(sessions, customers, stationsLookup);
      toast.success('Sessions exported successfully');
    } catch (error) {
      console.error('Error exporting sessions:', error);
      toast.error('Failed to export sessions data');
    }
  }, [sessions, customers, stationsLookup]);
  
  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  return { 
    sessions, 
    sessionsLoading, 
    fetchSessions, 
    deleteSession,
    exportSessions
  };
};
