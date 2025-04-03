
import React, { useState, useEffect } from 'react';
import { Station } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StationTimerProps {
  station: Station;
}

const StationTimer: React.FC<StationTimerProps> = ({ station }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!station.isOccupied || !station.currentSession) {
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setCost(0);
      return;
    }

    // Get session ID from current session
    const sessionId = station.currentSession.id;
    console.log("Timer tracking session ID:", sessionId);
    
    // Initial fetch of session data
    const fetchSessionData = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('start_time')
          .eq('id', sessionId)
          .single();
          
        if (error) {
          console.error("Error fetching session data:", error);
          toast({
            title: "Error",
            description: "Could not fetch session data",
            variant: "destructive"
          });
          return;
        }
        
        if (data) {
          updateTimerDisplay(new Date(data.start_time));
        }
      } catch (error) {
        console.error("Error in fetchSessionData:", error);
      }
    };
    
    // Calculate and update the timer display
    const updateTimerDisplay = (startTime: Date) => {
      const now = new Date();
      const elapsedMs = now.getTime() - startTime.getTime();
      
      const secondsTotal = Math.floor(elapsedMs / 1000);
      const minutesTotal = Math.floor(secondsTotal / 60);
      const hoursTotal = Math.floor(minutesTotal / 60);
      
      setSeconds(secondsTotal % 60);
      setMinutes(minutesTotal % 60);
      setHours(hoursTotal);
      
      // Calculate cost based on hourly rate
      const hoursElapsed = elapsedMs / (1000 * 60 * 60);
      const calculatedCost = Math.max(Math.ceil(hoursElapsed * station.hourlyRate), 1);
      setCost(calculatedCost);
      
      console.log("Timer update from Supabase:", {
        startTime: startTime.toISOString(),
        elapsedMs,
        secondsTotal,
        minutesTotal,
        hoursTotal,
        hourlyRate: station.hourlyRate,
        hoursElapsed,
        calculatedCost
      });
    };

    // Fetch the data immediately
    fetchSessionData();
    
    // Set up real-time subscription to session updates
    const subscription = supabase
      .channel(`session_timer_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session updated:', payload);
          if (payload.new && payload.new.start_time) {
            updateTimerDisplay(new Date(payload.new.start_time));
          }
        }
      )
      .subscribe();
    
    // Set up interval to update timer every second
    const intervalId = setInterval(() => {
      if (station.currentSession && station.currentSession.startTime) {
        const startTime = new Date(station.currentSession.startTime);
        updateTimerDisplay(startTime);
      }
    }, 1000);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
      subscription.unsubscribe();
    };
  }, [station, toast]);

  const formatTimeDisplay = () => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!station.isOccupied || !station.currentSession) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Duration:</span>
        <span className="font-mono bg-gray-800 px-3 py-1 rounded text-purple-400 font-bold">
          {formatTimeDisplay()}
        </span>
      </div>
      <div className="flex justify-between text-sm font-medium">
        <span className="text-gray-300">Current Cost:</span>
        <CurrencyDisplay amount={cost} className="text-orange-500 font-bold" />
      </div>
    </div>
  );
};

export default StationTimer;
