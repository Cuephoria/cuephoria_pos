
import { useState } from 'react';
import { Session } from '@/types/pos.types';
import { PauseSessionResult } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePauseSession = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pauseSession = async (sessionId: string): Promise<PauseSessionResult> => {
    setIsLoading(true);
    try {
      // Get current session data
      const { data: sessionData, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError || !sessionData) {
        console.error('Error fetching session to pause:', fetchError);
        toast.error('Failed to pause session. Session not found.');
        return { success: false, error: 'Session not found' };
      }

      const now = new Date().toISOString();
      
      // Store the pause timestamp
      const { data: updatedSessionData, error: updateError } = await supabase
        .from('sessions')
        .update({
          is_paused: true,
          paused_at: now,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error pausing session:', updateError);
        toast.error('Failed to pause session. Please try again.');
        return { success: false, error: updateError.message };
      }

      // Convert Supabase response to our Session type
      const updatedSession: Session = {
        id: updatedSessionData.id,
        stationId: updatedSessionData.station_id,
        customerId: updatedSessionData.customer_id,
        startTime: new Date(updatedSessionData.start_time),
        endTime: updatedSessionData.end_time ? new Date(updatedSessionData.end_time) : undefined,
        duration: updatedSessionData.duration,
        isPaused: updatedSessionData.is_paused,
        pausedAt: updatedSessionData.paused_at ? new Date(updatedSessionData.paused_at) : undefined,
        totalPausedTime: updatedSessionData.total_paused_time || 0
      };

      toast.success('Session paused successfully');
      return { success: true, session: updatedSession };
    } catch (error) {
      console.error('Unexpected error pausing session:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsLoading(false);
    }
  };

  const resumeSession = async (sessionId: string): Promise<PauseSessionResult> => {
    setIsLoading(true);
    try {
      // Get current session data
      const { data: sessionData, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError || !sessionData) {
        console.error('Error fetching session to resume:', fetchError);
        toast.error('Failed to resume session. Session not found.');
        return { success: false, error: 'Session not found' };
      }

      const pauseTime = sessionData.paused_at ? new Date(sessionData.paused_at) : null;
      const now = new Date();
      
      // Calculate pause duration in milliseconds
      let totalPauseDuration = sessionData.total_paused_time || 0;
      
      if (pauseTime) {
        const pauseDurationMs = now.getTime() - pauseTime.getTime();
        totalPauseDuration += pauseDurationMs;
      }
      
      // Update session with resume information
      const { data: updatedSessionData, error: updateError } = await supabase
        .from('sessions')
        .update({
          is_paused: false,
          paused_at: null,
          total_paused_time: totalPauseDuration
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error resuming session:', updateError);
        toast.error('Failed to resume session. Please try again.');
        return { success: false, error: updateError.message };
      }

      // Convert Supabase response to our Session type
      const updatedSession: Session = {
        id: updatedSessionData.id,
        stationId: updatedSessionData.station_id,
        customerId: updatedSessionData.customer_id,
        startTime: new Date(updatedSessionData.start_time),
        endTime: updatedSessionData.end_time ? new Date(updatedSessionData.end_time) : undefined,
        duration: updatedSessionData.duration,
        isPaused: updatedSessionData.is_paused,
        pausedAt: updatedSessionData.paused_at ? new Date(updatedSessionData.paused_at) : undefined,
        totalPausedTime: updatedSessionData.total_paused_time || 0
      };

      toast.success('Session resumed successfully');
      return { success: true, session: updatedSession };
    } catch (error) {
      console.error('Unexpected error resuming session:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error: 'Unexpected error' };
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
