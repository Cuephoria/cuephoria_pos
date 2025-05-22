
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { calculateElapsedTime, formatTimeDisplay } from '@/utils/booking/formatters';

interface RunningTimerProps {
  startTime: Date;
  compact?: boolean;
}

const RunningTimer: React.FC<RunningTimerProps> = ({ startTime, compact = false }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  
  useEffect(() => {
    // Function to update the timer
    const updateTimer = () => {
      try {
        const { hours: h, minutes: m, seconds: s } = calculateElapsedTime(startTime);
        setHours(h);
        setMinutes(m);
        setSeconds(s);
      } catch (error) {
        console.error("RunningTimer: Error updating timer", error);
      }
    };
    
    // Initial update
    updateTimer();
    
    // Set up interval for regular updates
    const intervalId = setInterval(updateTimer, 1000);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [startTime]);
  
  if (compact) {
    return (
      <div className="flex items-center text-xs text-gray-300">
        <Clock className="h-3 w-3 mr-1" />
        <span className={`font-mono ${seconds % 2 === 0 ? 'text-white' : 'text-white/90'}`}>
          {formatTimeDisplay(hours, minutes, seconds)}
        </span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-sm">
      <Clock className="h-4 w-4 mr-1 text-cuephoria-purple" />
      <span className={`font-mono ${seconds % 2 === 0 ? 'text-white' : 'text-white/90'}`}>
        {formatTimeDisplay(hours, minutes, seconds)}
      </span>
    </div>
  );
};

export default RunningTimer;
