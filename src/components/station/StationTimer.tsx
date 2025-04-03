
import React, { useState, useEffect, useRef } from 'react';
import { Station } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';

interface StationTimerProps {
  station: Station;
}

const StationTimer: React.FC<StationTimerProps> = ({ station }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  
  // Use refs to maintain values between renders
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing intervals
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!station.isOccupied || !station.currentSession) {
      setElapsedTime(0);
      setCost(0);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      startTimeRef.current = null;
      return;
    }

    // Convert session startTime to a timestamp
    const startTime = station.currentSession.startTime instanceof Date
      ? station.currentSession.startTime.getTime()
      : new Date(station.currentSession.startTime).getTime();
    
    startTimeRef.current = startTime;
    
    console.log("Timer start time:", new Date(startTime).toISOString());
    
    // Immediately update once
    updateElapsedTime();
    
    // Then set interval for regular updates
    intervalRef.current = window.setInterval(updateElapsedTime, 1000);
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [station.isOccupied, station.currentSession, station.hourlyRate]);

  const updateElapsedTime = () => {
    if (!startTimeRef.current) return;
    
    const now = new Date().getTime();
    const elapsedMs = now - startTimeRef.current;
    
    const secondsTotal = Math.floor(elapsedMs / 1000);
    const minutesTotal = Math.floor(secondsTotal / 60);
    const hoursTotal = Math.floor(minutesTotal / 60);
    
    setSeconds(secondsTotal % 60);
    setMinutes(minutesTotal % 60);
    setHours(hoursTotal);
    
    setElapsedTime(minutesTotal);
    
    // Calculate cost based on hourly rate - local calculation
    const hoursElapsed = elapsedMs / (1000 * 60 * 60);
    const calculatedCost = Math.ceil(hoursElapsed * station.hourlyRate);
    setCost(calculatedCost);
    
    console.log("Timer update:", {
      elapsedMs,
      secondsTotal,
      minutesTotal,
      hoursTotal,
      hourlyRate: station.hourlyRate,
      hoursElapsed,
      calculatedCost
    });
  };

  const formatTimeDisplay = () => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!station.isOccupied || !station.currentSession) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Duration:</span>
        <span className="font-mono bg-black/10 px-2 py-1 rounded text-cuephoria-lightpurple font-bold">
          {formatTimeDisplay()}
        </span>
      </div>
      <div className="flex justify-between text-sm font-medium mt-2">
        <span>Current Cost:</span>
        <CurrencyDisplay amount={cost} className="text-cuephoria-orange font-bold" />
      </div>
    </div>
  );
};

export default StationTimer;
