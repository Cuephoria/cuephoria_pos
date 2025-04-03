
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

    // Initial calculation based on local session data
    const updateTimerFromLocalData = () => {
      if (station.currentSession && station.currentSession.startTime) {
        const startTime = new Date(station.currentSession.startTime);
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
        const calculatedCost = Math.ceil(hoursElapsed * station.hourlyRate);
        setCost(calculatedCost);
        
        console.log("Local timer update:", {
          sessionId: station.currentSession.id,
          startTime: startTime.toISOString(),
          elapsedMs,
          secondsTotal,
          minutesTotal,
          hoursTotal,
          hourlyRate: station.hourlyRate,
          calculatedCost
        });
      }
    };

    // Try to get session data from Supabase
    const fetchSessionData = async () => {
      try {
        if (!station.currentSession) return;
        
        const sessionId = station.currentSession.id;
        console.log("Fetching session data for ID:", sessionId);
        
        const { data, error } = await supabase
          .from('sessions')
          .select('start_time')
          .eq('id', sessionId)
          .single();
          
        if (error) {
          console.error("Error fetching session data:", error);
          // Fallback to local data
          updateTimerFromLocalData();
          return;
        }
        
        if (data && data.start_time) {
          const startTime = new Date(data.start_time);
          console.log("Session start time from Supabase:", startTime);
          
          // Update timer with Supabase data
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
          const calculatedCost = Math.ceil(hoursElapsed * station.hourlyRate);
          setCost(calculatedCost);
          
          console.log("Supabase timer update:", {
            startTime: startTime.toISOString(),
            elapsedMs,
            secondsTotal,
            minutesTotal,
            hoursTotal,
            hourlyRate: station.hourlyRate,
            calculatedCost
          });
        } else {
          // Fallback to local data
          updateTimerFromLocalData();
        }
      } catch (error) {
        console.error("Error in fetchSessionData:", error);
        // Fallback to local data
        updateTimerFromLocalData();
      }
    };
    
    // Fetch data initially
    fetchSessionData();
    
    // Set up interval for regular updates
    const intervalId = setInterval(() => {
      updateTimerFromLocalData();
    }, 1000);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [station]);

  const formatTimeDisplay = () => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!station.isOccupied || !station.currentSession) {
    return null;
  }

  return (
    <div className="space-y-4 bg-black/70 p-3 rounded-lg">
      <div className="text-center">
        <span className="font-mono text-2xl bg-black px-4 py-2 rounded-lg text-white font-bold inline-block w-full">
          {formatTimeDisplay()}
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
