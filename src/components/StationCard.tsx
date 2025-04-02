
import React, { useState } from 'react';
import { Clock, Play, Square, CalendarClock, Settings, UserCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePOS } from '@/context/POSContext';
import { Station } from '@/types/pos.types';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { startSession, endSession, updateStation } = usePOS();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Calculate session duration if station is occupied
  const sessionDuration = station.isOccupied && station.currentSession?.startTime 
    ? Math.floor((Date.now() - station.currentSession.startTime) / (1000 * 60)) 
    : 0;
  
  const hours = Math.floor(sessionDuration / 60);
  const minutes = sessionDuration % 60;
  
  const handleStartSession = () => {
    if (customerId) {
      startSession(station.id, customerId);
      setShowStartDialog(false);
      setCustomerId('');
    }
  };
  
  const handleEndSession = () => {
    endSession(station.id);
    setShowEndDialog(false);
  };
  
  const toggleMaintenance = () => {
    const newStatus = station.status === 'maintenance' ? 'available' : 'maintenance';
    updateStation({
      ...station,
      status: newStatus,
      isOccupied: newStatus === 'maintenance' ? false : station.isOccupied
    });
    setMaintenanceMode(newStatus === 'maintenance');
  };
  
  return (
    <>
      <Card className={`bg-cuephoria-darker border-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        station.status === 'maintenance' 
          ? 'border-l-4 border-l-yellow-500 shadow-yellow-900/20' 
          : station.isOccupied 
            ? 'border-l-4 border-l-green-500 shadow-green-900/20' 
            : 'border-l-4 border-l-cuephoria-lightpurple shadow-cuephoria-lightpurple/10'
      }`}>
        <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-12 -translate-y-12 rotate-45 ${
          station.status === 'maintenance' 
            ? 'bg-yellow-500/10' 
            : station.isOccupied 
              ? 'bg-green-500/10' 
              : 'bg-cuephoria-lightpurple/5'
        }`}></div>
        
        <CardContent className="p-4 relative">
          <div className="flex justify-between items-start mb-3">
            <div>
              <Badge 
                className={`${
                  station.status === 'maintenance' 
                    ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' 
                    : station.isOccupied 
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                      : 'bg-cuephoria-purple/20 text-cuephoria-lightpurple hover:bg-cuephoria-purple/30'
                }`}
              >
                {station.status === 'maintenance' 
                  ? 'Maintenance' 
                  : station.isOccupied 
                    ? 'Active' 
                    : 'Available'}
              </Badge>
              
              <h3 className="text-lg font-bold mt-2">{station.name}</h3>
              <p className="text-sm text-gray-400">
                {station.type === 'ps5' ? 'PlayStation 5' : '8-Ball Table'}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-xs text-gray-400">Hourly Rate</p>
              <p className="text-xl font-bold">${station.hourlyRate.toFixed(2)}</p>
            </div>
          </div>
          
          {station.isOccupied && station.currentSession && (
            <div className="mt-3 bg-cuephoria-dark/50 p-3 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> Started:
                </span>
                <span className="text-xs">
                  {format(new Date(station.currentSession.startTime), 'h:mm a')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 flex items-center">
                  <CalendarClock className="h-3 w-3 mr-1" /> Duration:
                </span>
                <span className="text-xs">
                  {hours > 0 ? `${hours}h ` : ''}{minutes}m
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400 flex items-center">
                  <UserCheck className="h-3 w-3 mr-1" /> Customer:
                </span>
                <span className="text-xs">
                  {station.currentSession.customerName || 'Guest'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex gap-2">
          {station.status === 'maintenance' ? (
            <Button 
              variant="outline" 
              size="sm"
              className="border-yellow-500/30 text-yellow-400 flex-1 hover:bg-yellow-500/20 hover:text-yellow-300"
              onClick={toggleMaintenance}
            >
              <Settings className="h-4 w-4 mr-2" /> End Maintenance
            </Button>
          ) : station.isOccupied ? (
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-500/30 text-red-400 flex-1 hover:bg-red-500/20 hover:text-red-300"
              onClick={() => setShowEndDialog(true)}
            >
              <Square className="h-4 w-4 mr-2" /> End Session
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-500/30 text-green-400 flex-1 hover:bg-green-500/20 hover:text-green-300"
                onClick={() => setShowStartDialog(true)}
              >
                <Play className="h-4 w-4 mr-2" /> Start Session
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300"
                onClick={toggleMaintenance}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      
      {/* Start Session Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30 text-white">
          <DialogHeader>
            <DialogTitle>Start Session for {station.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm">Customer ID (optional)</label>
              <Input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter customer ID"
                className="bg-cuephoria-dark border-cuephoria-lightpurple/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStartDialog(false)}
              className="border-cuephoria-lightpurple/30 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              className="bg-gradient-to-r from-green-500 to-green-700"
            >
              Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30 text-white">
          <DialogHeader>
            <DialogTitle>End Session for {station.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Are you sure you want to end this session?</p>
            {station.currentSession && (
              <div className="bg-cuephoria-dark/50 p-3 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Duration:</span>
                  <span className="text-sm font-medium">
                    {hours > 0 ? `${hours}h ` : ''}{minutes}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Amount:</span>
                  <span className="text-sm font-medium">
                    ${((hours + (minutes / 60)) * station.hourlyRate).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEndDialog(false)}
              className="border-cuephoria-lightpurple/30 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndSession}
              className="bg-gradient-to-r from-red-500 to-red-700"
            >
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StationCard;
