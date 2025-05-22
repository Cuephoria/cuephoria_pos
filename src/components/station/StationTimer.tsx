
import React, { useState, useEffect, useRef } from 'react';
import { Station } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { formatTimeDisplay, calculateElapsedTime, calculateSessionCost } from '@/utils/booking/formatters';
import { Clock, DollarSign } from 'lucide-react';

interface StationTimerProps {
  station: Station;
  compact?: boolean;
}

const StationTimer: React.FC<StationTimerProps> = ({ station, compact = false }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sessionStatus, setSessionStatus] = useState<string>('active');
  const { toast } = useToast();
  const { customers } = usePOS();
  const timerRef = useRef<number | null>(null);
  const sessionDataRef = useRef<{
    sessionId: string;
    startTime: Date;
    stationId: string;
    customerId: string;
    hourlyRate: number;
    status?: string;
  } | null>(null);

  // Clear interval on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Re-initialize timer when station data changes
  useEffect(() => {
    // Check if session is completed from database on initial load and station changes
    const checkSessionStatus = async () => {
      if (!station.currentSession) return;
      
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('status, end_time')
          .eq('id', station.currentSession.id)
          .single();
          
        if (error) {
          console.error("StationTimer: Error fetching session status", error);
          return;
        }
        
        if (data) {
          console.log(`StationTimer: Session ${station.currentSession.id} status from DB:`, data.status);
          
          // If session is completed in database but not in local state
          if (data.status === 'completed' || data.end_time) {
            console.log("StationTimer: Session is completed in database but not in local state, refreshing");
            setSessionStatus('completed');
            
            // Force reload the page to update station state
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            
            return;
          }
          
          setSessionStatus(data.status || 'active');
        }
      } catch (error) {
        console.error("StationTimer: Error checking session status", error);
      }
    };
    
    checkSessionStatus();
    
    if (!station.isOccupied || !station.currentSession) {
      // Reset timer state when station is not occupied
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setCost(0);
      setSessionStatus('completed');
      
      // Clear any existing timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      sessionDataRef.current = null;
      return;
    }

    // Store the session data in ref to maintain persistence across renders
    if (station.currentSession) {
      sessionDataRef.current = {
        sessionId: station.currentSession.id,
        startTime: new Date(station.currentSession.startTime),
        stationId: station.id,
        customerId: station.currentSession.customerId,
        hourlyRate: station.hourlyRate,
        status: station.currentSession.status || 'active'
      };
      
      setSessionStatus(station.currentSession.status || 'active');
      
      // Ensure we have a valid start time
      if (isNaN(sessionDataRef.current.startTime.getTime())) {
        console.error("StationTimer: Invalid start time for session", station.currentSession);
        sessionDataRef.current.startTime = new Date();
      }
    }

    // Initialize timer calculation immediately
    if (sessionDataRef.current) {
      updateTimerCalculation();
    }

    // Set up interval for regular updates if not already running and session is active
    if (timerRef.current === null && station.currentSession && 
        sessionStatus !== 'completed') {
      timerRef.current = window.setInterval(() => {
        updateTimerCalculation();
      }, 1000);
    }

    // Fetch the latest session data from Supabase for accuracy
    fetchSessionData();
  }, [station]);

  // Function to update timer calculation based on session data
  const updateTimerCalculation = () => {
    if (!sessionDataRef.current) return;
    if (sessionStatus === 'completed') return;
    
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
      setIsRefreshing(true);
      if (!station.currentSession) return;
      
      const sessionId = station.currentSession.id;
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (error) {
        console.error("StationTimer: Error fetching session data", error);
        // Fallback to current data
        setIsRefreshing(false);
        return;
      }
      
      if (data) {
        // Use type assertion since we know this data should exist
        const sessionData = data as any;
        
        // Check if session is completed in database
        if (sessionData && sessionData.status === 'completed') {
          console.log("StationTimer: Session is marked as completed in database");
          setSessionStatus('completed');
          
          // Clear timer if running
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Force refresh the page to update station state
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
          setIsRefreshing(false);
          return;
        }
        
        if (sessionData && sessionData.start_time) {
          const startTime = new Date(sessionData.start_time);
          
          // Update the sessionDataRef with data from Supabase
          if (sessionDataRef.current) {
            sessionDataRef.current.startTime = startTime;
            sessionDataRef.current.status = sessionData.status;
          } else {
            sessionDataRef.current = {
              sessionId,
              startTime,
              stationId: station.id,
              customerId: station.currentSession.customerId,
              hourlyRate: station.hourlyRate,
              status: sessionData.status
            };
          }
          
          setSessionStatus(sessionData.status || 'active');
          
          // Update timer calculation with fresh data
          updateTimerCalculation();
        }
      }
      setIsRefreshing(false);
    } catch (error) {
      console.error("StationTimer: Error in fetchSessionData", error);
      setIsRefreshing(false);
    }
  };

  // If session is completed, don't show the timer
  if (!station.isOccupied || !station.currentSession || sessionStatus === 'completed') {
    return null;
  }

  if (compact) {
    return (
      <div className="text-center flex flex-col items-center">
        <div className="relative inline-block">
          <span className={`font-mono text-base ${seconds % 2 === 0 ? 'text-white' : 'text-white/90'} 
            bg-black bg-opacity-80 px-3 py-1 rounded text-white font-medium inline-block
            border border-gray-700/50 shadow-[0_0_15px_rgba(14,165,233,0.2)]`}
          >
            {formatTimeDisplay(hours, minutes, seconds)}
          </span>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cuephoria-blue to-transparent"></div>
        </div>
        <div className="mt-1 text-xs font-medium text-cuephoria-orange">
          <CurrencyDisplay amount={cost} className="text-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gradient-to-b from-black/80 to-gray-900/80 p-4 rounded-lg border border-gray-700/30 shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-cuephoria-purple/5 to-cuephoria-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="text-center relative">
        <Clock className="h-4 w-4 text-gray-400 absolute left-1/2 -translate-x-1/2 -top-2" />
        <span className={`font-mono text-2xl bg-black px-4 py-2 rounded-lg text-white font-bold inline-block w-full
          ${seconds % 2 === 0 ? 'text-white' : 'text-white/90'} border border-gray-700/50 shadow-inner`}
        >
          {formatTimeDisplay(hours, minutes, seconds)}
        </span>
        <div className="h-[2px] w-3/4 mx-auto mt-1 bg-gradient-to-r from-transparent via-cuephoria-blue/50 to-transparent"></div>
      </div>
      
      <div className="flex justify-between items-center relative">
        <span className="text-white flex items-center">
          <DollarSign className="h-4 w-4 text-cuephoria-orange mr-1" /> Current Cost:
        </span>
        <CurrencyDisplay amount={cost} className="text-cuephoria-orange font-bold text-lg" />
      </div>
    </div>
  );
};

export default StationTimer;
