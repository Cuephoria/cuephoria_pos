
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Gamepad2, Table2, X, Search } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { motion } from 'framer-motion';
import RunningTimer from '@/components/station/RunningTimer';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface ActiveSessionsProps {
  limit?: number;
  publicView?: boolean;
}

const ActiveSessions: React.FC<ActiveSessionsProps> = ({ limit, publicView = false }) => {
  const { stations, customers } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get occupied stations with sessions
  const activeStations = stations
    .filter(station => station.isOccupied && station.currentSession)
    .slice(0, limit);
  
  // Filter by search if provided
  const filteredStations = searchQuery.length > 0
    ? activeStations.filter(station => {
        const customer = customers.find(c => c.id === station.currentSession?.customerId);
        return station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (customer && customer.name.toLowerCase().includes(searchQuery.toLowerCase()));
      })
    : activeStations;
  
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
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by ID, name, or station..."
          className="pl-9 bg-gray-800/50 border-gray-700 placeholder:text-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {filteredStations.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center p-8 text-gray-400 border border-dashed border-gray-700 rounded-lg"
          variants={item}
        >
          <X className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-center">No matches found</p>
          <p className="text-xs text-gray-500 mt-1 text-center">Try a different search term</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredStations.map((station) => {
            const session = station.currentSession;
            if (!session) return null;
            
            const customer = customers.find(c => c.id === session.customerId);
            const isPS5 = station.type === 'ps5';
            
            return (
              <motion.div 
                key={station.id}
                variants={item}
                className="bg-gray-800/60 border border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
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
                      <div className="font-medium">{customer?.name || 'Walk-in Customer'}</div>
                      <div className="text-sm text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <span className="text-xs mr-2">Station:</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isPS5 ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                        }`}>
                          {station.name}
                        </span>
                      </div>
                      <div className="mt-1">
                        <RunningTimer startTime={session.startTime} compact={true} />
                      </div>
                    </div>
                    
                    <span className="text-lg font-mono">
                      <span className="text-xs mr-1 text-gray-500">ID:</span>
                      {session.id.substring(0, 6)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ActiveSessions;
