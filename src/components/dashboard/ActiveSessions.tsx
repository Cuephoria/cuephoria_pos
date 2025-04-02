
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Clock } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

const ActiveSessions: React.FC = () => {
  const { stations, sessions, customers } = usePOS();
  
  // Find all occupied stations
  const occupiedStations = stations.filter(s => s.isOccupied);
  
  // Calculate duration for active sessions
  const getSessionDuration = (sessionStartTime) => {
    const start = new Date(sessionStartTime);
    const now = new Date();
    const diffMs = now - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white font-heading">Active Gaming Sessions</CardTitle>
        <CardDescription className="text-gray-400">Currently active sessions at the center</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {occupiedStations.length > 0 ? (
          occupiedStations.map(station => {
            const session = sessions.find(s => s.stationId === station.id && !s.endTime);
            const customer = session ? customers.find(c => c.id === session.customerId) : null;
            
            return (
              <div key={station.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">{customer?.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-400">{station.name}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {session ? getSessionDuration(session.startTime) : '—'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center p-6 text-gray-400">
            <p>No active sessions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveSessions;
