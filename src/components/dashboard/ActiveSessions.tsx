
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Gamepad2, Table2, X } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import StationTimer from '@/components/station/StationTimer';
import { motion } from 'framer-motion';

interface ActiveSessionsProps {
  limit?: number;
}

const ActiveSessions: React.FC<ActiveSessionsProps> = ({ limit }) => {
  const { stations, customers } = usePOS();
  
  // Get occupied stations with sessions
  const activeStations = stations
    .filter(station => station.isOccupied && station.currentSession)
    .slice(0, limit);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {activeStations.length > 0 ? (
        activeStations.map((station, index) => {
          const session = station.currentSession;
          if (!session) return null;
          
          const customer = customers.find(c => c.id === session.customerId);
          const isPS5 = station.type === 'ps5';
          
          return (
            <motion.div 
              key={station.id} 
              className={`flex items-center justify-between p-4 rounded-lg border hover:border-opacity-70 transition-colors ${
                isPS5 
                  ? 'bg-gradient-to-r from-blue-900/40 to-blue-800/30 border-blue-700/50 hover:shadow-blue-900/20 hover:shadow-lg' 
                  : 'bg-gradient-to-r from-green-900/40 to-green-800/30 border-green-700/50 hover:shadow-green-900/20 hover:shadow-lg'
              }`}
              variants={item}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center space-x-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isPS5 ? 'bg-[#0EA5E9]/20' : 'bg-[#10B981]/20'
                }`}>
                  {isPS5 ? (
                    <Gamepad2 className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Table2 className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">{station.name}</p>
                    <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                      isPS5 ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                    }`}>
                      {isPS5 ? 'PS5' : '8-Ball'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <p className="truncate max-w-[120px]">{customer?.name || 'Walk-in Customer'}</p>
                  </div>
                </div>
              </div>
              <div>
                <StationTimer station={station} compact={true} />
              </div>
            </motion.div>
          );
        })
      ) : (
        <motion.div 
          className="flex flex-col items-center justify-center p-8 text-gray-400 border border-dashed border-gray-700 rounded-lg"
          variants={item}
        >
          <X className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-center">No active sessions</p>
          <p className="text-xs text-gray-500 mt-1 text-center">Book a session to get started</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ActiveSessions;
