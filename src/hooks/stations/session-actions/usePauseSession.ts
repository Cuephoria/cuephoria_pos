
import { useState } from 'react';
import { Session, Station } from '@/types/pos.types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SessionActionsProps, PauseSessionResult } from './types';

export const usePauseSession = (props: SessionActionsProps) => {
  const { stations, setStations, sessions, setSessions } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Pause an active session for a station
   */
  const pauseSession = async (stationId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Pausing session for station:", stationId);
      
      // Find the station
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.error("No active session found for this station");
        toast({
          title: "Session Error",
          description: "No active session found for this station",
          variant: "destructive"
        });
        return false;
      }
      
      const session = station.currentSession;
      
      // Check if the session is already paused
      if (session.isPaused) {
        console.warn("Session is already paused");
        toast({
          title: "Already Paused",
          description: "This session is already paused",
        });
        return false;
      }
      
      // Pause the session
      const pausedAt = new Date();
      
      // Update the session object
      const updatedSession: Session = {
        ...session,
        isPaused: true,
        pausedAt: pausedAt,
        totalPausedTime: session.totalPausedTime || 0, // Initialize if not set
      };
      
      // Update local state for immediate UI feedback
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, currentSession: updatedSession } 
          : s
      ));
      
      setSessions(prev => prev.map(s => 
        s.id === session.id ? updatedSession : s
      ));
      
      // Update the session in Supabase
      try {
        const { error } = await supabase
          .from('sessions')
          .update({
            is_paused: true,
            paused_at: pausedAt.toISOString(),
            total_paused_time: session.totalPausedTime || 0
          })
          .eq('id', session.id);
          
        if (error) {
          console.error("Error updating session pause state in Supabase:", error);
          toast({
            title: "Database Error",
            description: "Failed to update pause state in database, but the session is paused locally",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Supabase error when pausing session:", error);
      }
      
      toast({
        title: "Session Paused",
        description: `Session for ${station.name} has been paused`,
      });
      
      return true;
    } catch (error) {
      console.error("Error in pauseSession:", error);
      toast({
        title: "Error",
        description: "Failed to pause session: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resume a paused session for a station
   */
  const resumeSession = async (stationId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Resuming session for station:", stationId);
      
      // Find the station
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.error("No active session found for this station");
        toast({
          title: "Session Error",
          description: "No active session found for this station",
          variant: "destructive"
        });
        return false;
      }
      
      const session = station.currentSession;
      
      // Check if the session is actually paused
      if (!session.isPaused) {
        console.warn("Session is not paused");
        toast({
          title: "Not Paused",
          description: "This session is not paused",
        });
        return false;
      }
      
      // Calculate additional pause time to add to totalPausedTime
      const now = new Date();
      const pausedAt = session.pausedAt || now; // Fallback to now if pausedAt is missing
      const additionalPausedTime = now.getTime() - pausedAt.getTime();
      const totalPausedTime = (session.totalPausedTime || 0) + additionalPausedTime;
      
      // Update the session object
      const updatedSession: Session = {
        ...session,
        isPaused: false,
        pausedAt: undefined,
        totalPausedTime: totalPausedTime
      };
      
      // Update local state for immediate UI feedback
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, currentSession: updatedSession } 
          : s
      ));
      
      setSessions(prev => prev.map(s => 
        s.id === session.id ? updatedSession : s
      ));
      
      // Update the session in Supabase
      try {
        const { error } = await supabase
          .from('sessions')
          .update({
            is_paused: false,
            paused_at: null,
            total_paused_time: totalPausedTime
          })
          .eq('id', session.id);
          
        if (error) {
          console.error("Error updating session resume state in Supabase:", error);
          toast({
            title: "Database Error",
            description: "Failed to update resume state in database, but the session is resumed locally",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Supabase error when resuming session:", error);
      }
      
      toast({
        title: "Session Resumed",
        description: `Session for ${station.name} has been resumed`,
      });
      
      return true;
    } catch (error) {
      console.error("Error in resumeSession:", error);
      toast({
        title: "Error",
        description: "Failed to resume session: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    pauseSession,
    resumeSession,
    isLoading
  };
};
