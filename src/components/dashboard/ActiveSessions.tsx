
import React from 'react';
import { Clock } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { motion } from 'framer-motion';
import RunningTimer from '@/components/station/RunningTimer';

interface ActiveSessionsProps {
  limit?: number;
  publicView?: boolean;
}

const ActiveSessions: React.FC<ActiveSessionsProps> = ({ limit, publicView = false }) => {
  const { stations, customers } = usePOS();
  
  // Get occupied stations with sessions
  const activeStations = stations
    .filter(station => station.isOccupied && station.currentSession)
    .slice(0, limit);
  
  if (activeStations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <p className="text-center">No active sessions</p>
        <p className="text-xs text-gray-500 mt-1 text-center">Book a session to get started</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {activeStations.map((station) => {
        const session = station.currentSession;
        if (!session) return null;
        
        const customer = customers.find(c => c.id === session.customerId);
        
        return (
          <motion.div 
            key={station.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-4 mb-4"
          >
            <div className="bg-[#1E2A3E] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-14 w-14 bg-[#1E3A5E] rounded-full flex items-center justify-center mr-4">
                  <Clock className="h-8 w-8 text-[#0FA0CE]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{station.name}</p>
                  <p className="text-gray-400">{customer?.name || 'Unknown Customer'}</p>
                </div>
              </div>
              
              <div className="text-xl text-white font-mono">
                <RunningTimer startTime={session.startTime} compact={true} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActiveSessions;
