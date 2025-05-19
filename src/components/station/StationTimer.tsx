
import React from 'react';
import { differenceInMinutes } from 'date-fns';
import { Station } from '@/types/pos.types';

interface StationTimerProps {
  station: Station;
}

const StationTimer: React.FC<StationTimerProps> = ({ station }) => {
  const startTime = station.currentSession?.startTime;
  
  if (!startTime) {
    return <div className="text-sm">Session not started</div>;
  }

  const duration = differenceInMinutes(new Date(), new Date(startTime));
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return (
    <div className="text-sm">
      Time elapsed: {hours}h {minutes}m
    </div>
  );
};

export default StationTimer;
