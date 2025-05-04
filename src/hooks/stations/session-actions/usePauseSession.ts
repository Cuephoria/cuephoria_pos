
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
      
      // Update session with pause information
      const { data: updatedSession, error: updateError } = await supabase
        .from('sessions')
        .update({
          is_paused: true,
          pause_time: now,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error pausing session:', updateError);
        toast.error('Failed to pause session. Please try again.');
        return { success: false, error: updateError.message };
      }

      toast.success('Session paused successfully');
      return { success: true, session: updatedSession as Session };
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

      const pauseTime = sessionData.pause_time ? new Date(sessionData.pause_time) : null;
      const now = new Date();
      
      // Calculate pause duration in milliseconds
      let totalPauseDuration = sessionData.pause_duration || 0;
      
      if (pauseTime) {
        const pauseDurationMs = now.getTime() - pauseTime.getTime();
        totalPauseDuration += pauseDurationMs;
      }
      
      // Update session with resume information
      const { data: updatedSession, error: updateError } = await supabase
        .from('sessions')
        .update({
          is_paused: false,
          pause_time: null,
          pause_duration: totalPauseDuration
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error resuming session:', updateError);
        toast.error('Failed to resume session. Please try again.');
        return { success: false, error: updateError.message };
      }

      toast.success('Session resumed successfully');
      return { success: true, session: updatedSession as Session };
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
