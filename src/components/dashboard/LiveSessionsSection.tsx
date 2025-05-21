
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Users, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ActiveSessions from './ActiveSessions';
import { usePOS } from '@/context/POSContext';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface LiveSessionsSectionProps {
  publicView?: boolean;
}

const LiveSessionsSection: React.FC<LiveSessionsSectionProps> = ({ publicView = false }) => {
  const navigate = useNavigate();
  const { stations } = usePOS();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get occupied stations with sessions
  const activeStationsCount = stations.filter(station => station.isOccupied && station.currentSession).length;
  const totalStations = stations.length;
  const occupancyRate = totalStations > 0 ? Math.round((activeStationsCount / totalStations) * 100) : 0;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // This effect simulates updating the data
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Auto refresh every minute
  useEffect(() => {
    const interval = setInterval(handleRefresh, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 overflow-hidden shadow-xl">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center text-lg md:text-left">
            <Clock className="h-5 w-5 mr-2 text-cuephoria-purple animate-pulse-soft" />
            Live Active Sessions
          </CardTitle>
          {!publicView && (
            <div className="flex flex-wrap mt-1 space-x-2">
              <Badge variant="outline" className="bg-gray-800 text-xs">
                <Users className="h-3 w-3 mr-1" /> {activeStationsCount}/{totalStations} Stations Active
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  occupancyRate > 80 ? 'bg-red-900/50 text-red-300' : 
                  occupancyRate > 50 ? 'bg-yellow-900/50 text-yellow-300' : 
                  'bg-green-900/50 text-green-300'
                }`}
              >
                <Activity className="h-3 w-3 mr-1" /> {occupancyRate}% Occupancy
              </Badge>
            </div>
          )}
        </div>
        
        {!publicView && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`text-sm border-gray-700 ${isRefreshing ? 'animate-spin' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <Clock className="h-3 w-3 mr-1" />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <ActiveSessions publicView={publicView} />
        </div>
      </CardContent>
      
      <CardFooter className="bg-gradient-to-r from-gray-800/80 to-gray-800/50 pt-3 pb-3">
        <Button 
          onClick={() => navigate('/booknow')} 
          variant="default" 
          size="sm"
          className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue hover:opacity-90 group"
        >
          Book a Session
          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LiveSessionsSection;
