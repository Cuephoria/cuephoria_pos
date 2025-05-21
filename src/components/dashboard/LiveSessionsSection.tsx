
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ActiveSessions from './ActiveSessions';
import { usePOS } from '@/context/POSContext';

interface LiveSessionsSectionProps {
  publicView?: boolean;
}

const LiveSessionsSection: React.FC<LiveSessionsSectionProps> = ({ publicView = false }) => {
  const navigate = useNavigate();
  const { stations } = usePOS();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get occupied stations with sessions
  const activeStationsCount = stations.filter(station => station.isOccupied && station.currentSession).length;
  
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
    <Card className="bg-[#1A1F2C] border-gray-800 overflow-hidden shadow-xl">
      <CardContent className="p-0">
        <div className="flex flex-col space-y-4 p-0">
          <div className="flex justify-between items-center p-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Active Sessions</h2>
              <p className="text-gray-400">{activeStationsCount} active session{activeStationsCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-[#1E2A3E] flex items-center justify-center">
              <Clock className="h-8 w-8 text-[#0FA0CE]" />
            </div>
          </div>
          <div className="px-0">
            <ActiveSessions publicView={publicView} />
          </div>
        </div>
      </CardContent>
      
      {!publicView && (
        <CardFooter className="bg-[#1E2A3E]/50 pt-3 pb-3">
          <Button 
            onClick={() => navigate('/booknow')} 
            variant="default" 
            size="sm"
            className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue hover:opacity-90 group"
          >
            Book a Session
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default LiveSessionsSection;
