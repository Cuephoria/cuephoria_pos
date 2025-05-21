
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Gamepad2, Table2, X } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { motion } from 'framer-motion';
import RunningTimer from '@/components/station/RunningTimer';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

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
  
  if (activeStations.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center p-8 text-gray-400 border border-dashed border-gray-700 rounded-lg"
        variants={item}
        initial="hidden"
        animate="show"
      >
        <X className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-center">No active sessions</p>
        <p className="text-xs text-gray-500 mt-1 text-center">Book a session to get started</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="rounded-md"
    >
      <Table>
        <TableHeader className="bg-gray-900/60">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">Station</TableHead>
            <TableHead>Type</TableHead>
            {!publicView && <TableHead>Customer</TableHead>}
            <TableHead className="text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeStations.map((station) => {
            const session = station.currentSession;
            if (!session) return null;
            
            const customer = customers.find(c => c.id === session.customerId);
            const isPS5 = station.type === 'ps5';
            
            return (
              <TableRow 
                key={station.id} 
                className="border-gray-800 hover:bg-gray-800/40"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isPS5 ? 'bg-[#0EA5E9]/20' : 'bg-[#10B981]/20'
                    }`}>
                      {isPS5 ? (
                        <Gamepad2 className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Table2 className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <span>{station.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isPS5 ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {isPS5 ? 'PS5' : '8-Ball'}
                  </span>
                </TableCell>
                {!publicView && (
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-300">
                      <User className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate max-w-[120px]">{customer?.name || 'Walk-in Customer'}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  {session && session.startTime && (
                    <RunningTimer startTime={session.startTime} compact={publicView} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default ActiveSessions;
