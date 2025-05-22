
import React, { useState, useEffect, useRef } from 'react';
import { Station } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { formatTimeDisplay, calculateElapsedTime, calculateSessionCost } from '@/utils/booking/formatters';

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
  const timerRef = useRef<number | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const sessionDataRef = useRef<{
    sessionId: string;
    startTime: Date;
    stationId: string;
    customerId: string;
    hourlyRate: number;
    isActive: boolean;
  } | null>(null);
  const lastFetchRef = useRef<number>(Date.now());
  const fetchIntervalRef = useRef<number | null>(null);

  // Clear all timers and intervals on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (fetchIntervalRef.current) {
        window.clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
      
      // Reset state on unmount
      sessionDataRef.current = null;
      activeSessionIdRef.current = null;
    };
  }, []);

  // Re-initialize timer when station data changes
  useEffect(() => {
    console.log("StationTimer: Station data changed", {
      stationId: station.id,
      isOccupied: station.isOccupied,
      hasSession: !!station.currentSession,
      sessionId: station.currentSession?.id
    });

    // Clear existing timer when station changes or session ends
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clear fetch interval when station changes
    if (fetchIntervalRef.current) {
      window.clearInterval(fetchIntervalRef.current);
      fetchIntervalRef.current = null;
    }

    // If we were tracking a different session or no longer have a session, reset state
    if (!station.isOccupied || !station.currentSession || 
        (activeSessionIdRef.current && activeSessionIdRef.current !== station.currentSession.id)) {
      // Reset timer state when station is not occupied
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setCost(0);
      sessionDataRef.current = null;
      activeSessionIdRef.current = null;
      return;
    }

    // Store the session data in ref to maintain persistence across renders
    if (station.currentSession) {
      const sessionId = station.currentSession.id;
      
      // Only set up new timer if this is a different session than previously
      if (activeSessionIdRef.current !== sessionId) {
        console.log("StationTimer: Initializing with new session data", {
          sessionId: sessionId,
          startTime: new Date(station.currentSession.startTime).toISOString()
        });
        
        activeSessionIdRef.current = sessionId;
        
        sessionDataRef.current = {
          sessionId: sessionId,
          startTime: new Date(station.currentSession.startTime),
          stationId: station.id,
          customerId: station.currentSession.customerId,
          hourlyRate: station.hourlyRate,
          isActive: true
        };
        
        // Ensure we have a valid start time
        if (isNaN(sessionDataRef.current.startTime.getTime())) {
          console.error("StationTimer: Invalid start time for session", station.currentSession);
          sessionDataRef.current.startTime = new Date();
        }
      }
    }

    // Initialize timer calculation immediately
    if (sessionDataRef.current) {
      updateTimerCalculation();
    }

    // Set up interval for regular updates if not already running
    if (station.currentSession && !timerRef.current) {
      console.log("StationTimer: Setting up timer interval for station", station.id);
      
      timerRef.current = window.setInterval(() => {
        // Only update if the session is still active
        if (sessionDataRef.current?.isActive) {
          updateTimerCalculation();
        }
      }, 1000);
      
      // Set up periodic check with Supabase to verify session status
      fetchIntervalRef.current = window.setInterval(() => {
        // Only fetch if enough time has passed (avoid excessive API calls)
        const now = Date.now();
        if (now - lastFetchRef.current > 10000) { // 10 second cooldown
          lastFetchRef.current = now;
          fetchSessionData();
        }
      }, 10000); // Check every 10 seconds
    }

    // Fetch the latest session data from Supabase for accuracy
    fetchSessionData();
  }, [station, station.isOccupied, station.currentSession?.id]);

  // Function to update timer calculation based on session data
  const updateTimerCalculation = () => {
    if (!sessionDataRef.current || !sessionDataRef.current.isActive) return;
    
    try {
      const customer = customers.find(c => c.id === sessionDataRef.current?.customerId);
      const isMember = customer?.isMember || false;
      
      // Calculate elapsed time components
      const { hours: h, minutes: m, seconds: s, elapsedMs } = 
        calculateElapsedTime(sessionDataRef.current.startTime);
      
      // Update state with calculated values
      setHours(h);
      setMinutes(m);
      setSeconds(s);
      
      // Calculate and update cost
      const calculatedCost = calculateSessionCost(
        sessionDataRef.current.hourlyRate, 
        elapsedMs, 
        isMember
      );
      
      setCost(calculatedCost);
    } catch (error) {
      console.error("StationTimer: Error updating timer", error);
    }
  };

  // Fetch the latest session data from Supabase
  const fetchSessionData = async () => {
    try {
      if (!station.currentSession) {
        if (sessionDataRef.current?.isActive) {
          console.log("StationTimer: No current session but timer was active, stopping timer");
          sessionDataRef.current.isActive = false;
        }
        return;
      }
      
      const sessionId = station.currentSession.id;
      console.log("StationTimer: Fetching session data for ID:", sessionId);
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (error) {
        console.error("StationTimer: Error fetching session data", error);
        // Continue with current data
        return;
      }
      
      if (data) {
        // Use type assertion since we know this data should exist
        const sessionData = data as any;
        
        // Check if the session has been ended on the server but local state hasn't updated yet
        if (sessionData.end_time || sessionData.status === 'completed') {
          console.log("StationTimer: Session has been ended on server, clearing timer");
          
          // Mark session as inactive to stop updates
          if (sessionDataRef.current) {
            sessionDataRef.current.isActive = false;
          }
          
          // Clear timers
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          if (fetchIntervalRef.current) {
            window.clearInterval(fetchIntervalRef.current);
            fetchIntervalRef.current = null;
          }
          
          // Reset session refs
          sessionDataRef.current = null;
          activeSessionIdRef.current = null;
          return;
        }
        
        if (sessionData && sessionData.start_time) {
          const startTime = new Date(sessionData.start_time);
          console.log("StationTimer: Updated start time from Supabase", startTime.toISOString());
          
          // Update the sessionDataRef with data from Supabase
          if (sessionDataRef.current) {
            sessionDataRef.current.startTime = startTime;
            // Session is still active in the database
            sessionDataRef.current.isActive = true;
          } else {
            sessionDataRef.current = {
              sessionId,
              startTime,
              stationId: station.id,
              customerId: station.currentSession.customerId,
              hourlyRate: station.hourlyRate,
              isActive: true
            };
          }
          
          // Update timer calculation with fresh data
          updateTimerCalculation();
        }
      }
    } catch (error) {
      console.error("StationTimer: Error in fetchSessionData", error);
    }
  };

  if (!station.isOccupied || !station.currentSession || !sessionDataRef.current?.isActive) {
    return null;
  }

  return (
    <div className="space-y-4 bg-black/70 p-3 rounded-lg">
      <div className="text-center">
        <span className="font-mono text-2xl bg-black px-4 py-2 rounded-lg text-white font-bold inline-block w-full">
          {formatTimeDisplay(hours, minutes, seconds)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-white">Current Cost:</span>
        <CurrencyDisplay amount={cost} className="text-cuephoria-orange font-bold text-lg" />
      </div>
    </div>
  );
};

export default StationTimer;
