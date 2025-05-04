
import React, { useState, useEffect, useRef } from 'react';
import { Station } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { CirclePause } from 'lucide-react';

interface StationTimerProps {
  station: Station;
}

const StationTimer: React.FC<StationTimerProps> = ({ station }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const { toast } = useToast();
  const { customers } = usePOS();
  // Update the type here from number to NodeJS.Timeout
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionDataRef = useRef<{
    sessionId: string;
    startTime: Date;
    stationId: string;
    customerId: string;
    hourlyRate: number;
    isPaused: boolean;
    totalPausedTime: number;
    pausedAt?: Date;
    lastCost: number; // Store the last calculated cost for display when paused
  } | null>(null);

  // Force refresh of time display
  const forceRefresh = useRef<number>(0);

  useEffect(() => {
    if (!station.isOccupied || !station.currentSession) {
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setCost(0);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      sessionDataRef.current = null;
      return;
    }

    // Store the session data in ref to maintain persistence across renders
    if (station.currentSession) {
      const currentSessionData = {
        sessionId: station.currentSession.id,
        startTime: new Date(station.currentSession.startTime),
        stationId: station.id,
        customerId: station.currentSession.customerId,
        hourlyRate: station.hourlyRate,
        isPaused: station.currentSession.isPaused || false,
        totalPausedTime: station.currentSession.totalPausedTime || 0,
        pausedAt: station.currentSession.pausedAt,
        lastCost: sessionDataRef.current?.lastCost || 0 // Preserve last cost if exists
      };

      sessionDataRef.current = currentSessionData;
      
      // Immediately force an update with the new session data
      updateTimerDisplay();
    }

    // Find the customer to check if they are a member
    const customer = customers.find(c => c.id === station.currentSession?.customerId);
    const isMember = customer?.isMember || false;

    // Function to update timer display based on current session data
    function updateTimerDisplay() {
      if (!sessionDataRef.current) return;
      
      const { startTime, isPaused, totalPausedTime, pausedAt } = sessionDataRef.current;
      const now = new Date();
      
      // Calculate elapsed time accounting for pauses
      let elapsedMs = now.getTime() - startTime.getTime();
      
      // Subtract total paused time
      if (totalPausedTime) {
        elapsedMs -= totalPausedTime;
      }
      
      // If currently paused, subtract the time since pause started
      if (isPaused && pausedAt) {
        const currentPauseMs = now.getTime() - pausedAt.getTime();
        elapsedMs -= currentPauseMs;
      }
      
      // Don't allow negative time
      elapsedMs = Math.max(0, elapsedMs);
      
      // Calculate hours, minutes, seconds
      const secondsTotal = Math.floor(elapsedMs / 1000);
      const minutesTotal = Math.floor(secondsTotal / 60);
      const hoursTotal = Math.floor(minutesTotal / 60);
      
      setSeconds(secondsTotal % 60);
      setMinutes(minutesTotal % 60);
      setHours(hoursTotal);
      
      // Calculate cost based on hourly rate and actual elapsed time
      const hoursElapsed = elapsedMs / (1000 * 60 * 60);
      let calculatedCost = Math.ceil(hoursElapsed * station.hourlyRate);
      
      // Apply 50% discount for members
      if (isMember) {
        calculatedCost = Math.ceil(calculatedCost * 0.5); // 50% discount
      }
      
      // If paused, keep showing the last calculated cost
      if (isPaused) {
        if (sessionDataRef.current.lastCost === 0) {
          // If we just paused, store the current cost
          sessionDataRef.current.lastCost = calculatedCost;
        }
        calculatedCost = sessionDataRef.current.lastCost;
      } else {
        // Update the last cost when not paused
        if (sessionDataRef.current) {
          sessionDataRef.current.lastCost = calculatedCost;
        }
      }
      
      setCost(calculatedCost);
    }

    // Fetch latest session data from Supabase
    const fetchLatestSessionData = async () => {
      try {
        if (!station.currentSession) return;
        
        const sessionId = station.currentSession.id;
        
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
          
        if (error) {
          console.error("Error fetching session data:", error);
          return;
        }
        
        if (data) {
          const sessionData = data as any;
          
          if (sessionData && sessionData.start_time) {
            // Update session data with latest from database
            if (sessionDataRef.current) {
              sessionDataRef.current = {
                ...sessionDataRef.current,
                startTime: new Date(sessionData.start_time),
                isPaused: sessionData.is_paused || false,
                totalPausedTime: sessionData.total_paused_time || 0,
                pausedAt: sessionData.paused_at ? new Date(sessionData.paused_at) : undefined
              };
            }
            
            // Force immediate timer update with fresh data
            updateTimerDisplay();
          }
        }
      } catch (error) {
        console.error("Error in fetchLatestSessionData:", error);
      }
    };
    
    // Fetch data initially
    fetchLatestSessionData();

    // Set up regular refresh interval
    const refreshInterval = setInterval(() => {
      forceRefresh.current += 1;
      updateTimerDisplay();
    }, 1000);
    
    timerRef.current = refreshInterval;
    
    // Clean up
    return () => {
      clearInterval(refreshInterval);
    };
  }, [station, station.currentSession, station.currentSession?.isPaused, station.currentSession?.totalPausedTime, customers]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format time for display
  const formatTimeDisplay = () => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!station.isOccupied || !station.currentSession) {
    return null;
  }

  const isPaused = station.currentSession.isPaused || false;

  return (
    <div className="space-y-4 bg-black/70 p-3 rounded-lg">
      <div className="text-center relative">
        <div className="flex items-center justify-center gap-3">
          <span className={`font-mono text-2xl bg-black px-4 py-2 rounded-lg text-white font-bold inline-block ${isPaused ? 'opacity-60' : ''}`}>
            {formatTimeDisplay()}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-white">Current Cost:</span>
          {isPaused && (
            <CirclePause className="h-5 w-5 text-cuephoria-orange animate-pulse ml-1" />
          )}
        </div>
        <span className={`text-cuephoria-orange font-bold text-lg ${isPaused ? 'opacity-60' : ''}`}>
          ₹{Math.round(cost).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
};

export default StationTimer;
