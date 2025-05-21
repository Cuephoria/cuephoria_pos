
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, MoreVertical, User, Gamepad2, Table2 } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { formatTimeDisplay } from '@/utils/booking/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const ActiveSessions = () => {
  const { stations, customers } = usePOS();
  const navigate = useNavigate();
  
  // Get occupied stations with sessions
  const activeStations = stations.filter(station => station.isOccupied && station.currentSession);
  
  // Calculate session duration in minutes
  const getSessionDuration = (startTime: Date) => {
    // Ensure we're working with Date objects
    const start = new Date(startTime);
    const now = new Date();
    
    // Convert to milliseconds (numbers) before arithmetic
    const startMs = start.getTime();
    const nowMs = now.getTime();
    const durationMs = nowMs - startMs;
    
    // Convert milliseconds to minutes
    return Math.floor(durationMs / (1000 * 60));
  };

  // Get time components for display
  const getTimeComponents = (startTime: Date) => {
    const duration = getSessionDuration(startTime);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const seconds = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000) % 60;
    
    return { hours, minutes, seconds };
  };
  
  const handleViewStations = () => {
    navigate('/stations');
  };

  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Active Sessions</CardTitle>
            <CardDescription className="text-gray-400">{activeStations.length} active session{activeStations.length !== 1 ? 's' : ''}</CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10 h-8"
              size="sm"
              onClick={handleViewStations}
            >
              View All
            </Button>
            <div className="h-10 w-10 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-[#0EA5E9]" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeStations.length > 0 ? (
          activeStations.map(station => {
            const session = station.currentSession;
            if (!session) return null;
            
            const customer = customers.find(c => c.id === session.customerId);
            const { hours, minutes, seconds } = getTimeComponents(session.startTime);
            const isBilliardsTable = station.type === '8ball';
            
            // Calculate estimated cost
            const hoursPlayed = (hours + minutes/60);
            const cost = Math.ceil(hoursPlayed * station.hourlyRate);
            const discountedCost = customer?.isMember ? Math.ceil(cost * 0.5) : cost;
            
            return (
              <div key={station.id} className="relative overflow-hidden bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all p-3">
                {/* Color accent based on station type */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isBilliardsTable ? 'bg-green-500' : 'bg-cuephoria-purple'}`}></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 pl-3">
                    <div className={`h-10 w-10 rounded-full ${isBilliardsTable ? 'bg-green-500/20' : 'bg-cuephoria-purple/20'} flex items-center justify-center`}>
                      {isBilliardsTable ? 
                        <Table2 className="h-5 w-5 text-green-400" /> : 
                        <Gamepad2 className="h-5 w-5 text-cuephoria-lightpurple" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{station.name}</p>
                        {customer?.isMember && (
                          <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-500/50 text-[10px] px-1.5">
                            MEMBER
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <User className="h-3 w-3 mr-1 inline" />
                        <span>{customer?.name || 'Unknown Customer'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold text-white">
                        {formatTimeDisplay(hours, minutes, seconds)}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center justify-end">
                        <CurrencyDisplay 
                          amount={discountedCost} 
                          className={`${customer?.isMember ? 'text-green-400' : 'text-cuephoria-orange'} text-xs font-semibold`} 
                        />
                        {customer?.isMember && cost !== discountedCost && (
                          <span className="ml-1 line-through opacity-50 text-gray-500">
                            ₹{cost}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 space-y-2">
            <Clock className="h-12 w-12 text-gray-600 mb-2 opacity-50" />
            <p className="text-center">No active sessions</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2 text-blue-400 border-blue-500/20"
              onClick={handleViewStations}
            >
              Start a Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveSessions;
