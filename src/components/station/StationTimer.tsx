
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
  const [isSyncWithServer, setIsSyncWithServer] = useState<boolean>(true);
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
  const mountedRef = useRef<boolean>(true);

  // Clear all timers and intervals on component unmount to prevent memory leaks
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      
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
      setIsSyncWithServer(true); // Reset sync state
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

    // Immediately check if the session is truly active in database
    if (station.isOccupied && station.currentSession) {
      checkSessionStatusInDatabase(station.currentSession.id);
    }

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
      setIsSyncWithServer(true); // Reset sync state
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
        // Only update if the component is still mounted and session is active
        if (mountedRef.current && sessionDataRef.current?.isActive) {
          updateTimerCalculation();
        }
      }, 1000);
      
      // Set up periodic check with Supabase to verify session status
      fetchIntervalRef.current = window.setInterval(() => {
        // Only fetch if component is mounted and enough time has passed
        if (mountedRef.current) {
          const now = Date.now();
          if (now - lastFetchRef.current > 5000) { // Check every 5 seconds
            lastFetchRef.current = now;
            fetchSessionData();
          }
        }
      }, 5000); // Check every 5 seconds
    }

    // Fetch the latest session data from Supabase for accuracy
    fetchSessionData();
  }, [station, station.isOccupied, station.currentSession?.id]);
  
  // Check if a session is truly active in the database
  const checkSessionStatusInDatabase = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (error) {
        console.error("StationTimer: Error checking session status in database", error);
        setIsSyncWithServer(false);
        return;
      }
      
      if (data) {
        // Check if session is already completed in the database
        if (data.end_time || data.status === 'completed') {
          console.warn("StationTimer: Session is already marked as completed in the database, but local state shows it as active");
          
          if (sessionDataRef.current) {
            sessionDataRef.current.isActive = false;
          }
          
          setIsSyncWithServer(false);
        } else {
          setIsSyncWithServer(true);
        }
      }
    } catch (error) {
      console.error("StationTimer: Error checking session status", error);
      setIsSyncWithServer(false);
    }
  };

  // Function to update timer calculation based on session data
  const updateTimerCalculation = () => {
    if (!mountedRef.current || !sessionDataRef.current || !sessionDataRef.current.isActive) return;
    
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
    if (!mountedRef.current) return;
    
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
        setIsSyncWithServer(false);
        return;
      }
      
      if (data) {
        // Use type assertion since we know this data should exist
        const sessionData = data as any;
        setIsSyncWithServer(true);
        
        // Check if the session has been ended on the server but local state hasn't updated yet
        if (sessionData.end_time || sessionData.status === 'completed') {
          console.log("StationTimer: Session has been ended on server, stopping timer");
          
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
          
          // We could potentially notify the user that this session is actually ended
          toast({
            title: "Session Status Updated",
            description: "This session has already been ended.",
            variant: "default"
          });
          
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
      setIsSyncWithServer(false);
    }
  };

  if (!station.isOccupied || !station.currentSession || !sessionDataRef.current?.isActive) {
    return null;
  }

  return (
    <div className="space-y-4 bg-black/70 p-3 rounded-lg">
      {!isSyncWithServer && (
        <div className="bg-yellow-900/50 text-yellow-300 text-xs p-1 rounded text-center mb-2">
          Warning: Session might be out of sync with server
        </div>
      )}
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
