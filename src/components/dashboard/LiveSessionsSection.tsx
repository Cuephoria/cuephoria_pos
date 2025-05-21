
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ActiveSessions from './ActiveSessions';
import { usePOS } from '@/context/POSContext';

const LiveSessionsSection: React.FC = () => {
  const navigate = useNavigate();
  const { stations } = usePOS();
  
  // Get occupied stations with sessions
  const activeStationsCount = stations.filter(station => station.isOccupied && station.currentSession).length;

  return (
    <Card className="bg-gray-900/90 border-gray-800 overflow-hidden shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-cuephoria-purple" />
            Live Active Sessions
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm border-gray-700"
            onClick={() => navigate('/stations')}
          >
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ActiveSessions />
      </CardContent>
      
      {activeStationsCount > 0 && (
        <CardFooter className="bg-gray-800/50 pt-3 pb-3">
          <Button 
            onClick={() => navigate('/stations')} 
            variant="default" 
            size="sm"
            className="w-full bg-cuephoria-purple hover:bg-cuephoria-purple/90"
          >
            Manage Sessions
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default LiveSessionsSection;
