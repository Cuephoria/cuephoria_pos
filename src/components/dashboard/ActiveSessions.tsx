
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import StationTimer from '@/components/station/StationTimer';

interface ActiveSessionsProps {
  limit?: number;
}

const ActiveSessions: React.FC<ActiveSessionsProps> = ({ limit }) => {
  const { stations, customers } = usePOS();
  
  // Get occupied stations with sessions
  const activeStations = stations
    .filter(station => station.isOccupied && station.currentSession)
    .slice(0, limit);
  
  // Calculate session duration in minutes
  const getSessionDuration = (startTime: Date) => {
    const start = new Date(startTime);
    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    return Math.floor(durationMs / (1000 * 60));
  };
  
  return (
    <div className="space-y-4">
      {activeStations.length > 0 ? (
        activeStations.map(station => {
          const session = station.currentSession;
          if (!session) return null;
          
          const customer = customers.find(c => c.id === session.customerId);
          
          return (
            <div key={station.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-[#0EA5E9]/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">{station.name}</p>
                    <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                      {station.type === 'ps5' ? 'PS5' : '8-Ball'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <p>{customer?.name || 'Unknown Customer'}</p>
                  </div>
                </div>
              </div>
              <div>
                <StationTimer station={station} compact={true} />
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center p-6 text-gray-400">
          <p>No active sessions</p>
        </div>
      )}
    </div>
  );
};

export default ActiveSessions;
