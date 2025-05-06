
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePOS } from '@/context/POSContext';
import { Station } from '@/types/pos.types';
import StationInfo from './station/StationInfo';
import StationActions from './station/StationActions';
import StationTimer from './station/StationTimer';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import EditStationDialog from './EditStationDialog';

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { startSession, endSession, customers } = usePOS();
  const [editOpen, setEditOpen] = useState(false);
  
  // Debug log to verify customers are being passed to the StationActions component
  console.log(`StationCard ${station.name} has ${customers.length} customers to pass down`);
  
  return (
    <Card className={`border ${station.isOccupied ? 'border-green-500 bg-green-900/10' : 'border-gray-700 bg-gray-900/50'} transition-colors overflow-hidden relative`}>
      <div onClick={() => setEditOpen(true)} className="absolute top-2 right-2 p-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-full cursor-pointer">
        <Edit className="h-4 w-4 text-gray-400" />
      </div>
      
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <Badge variant={station.isOccupied ? "destructive" : "outline"} className={station.isOccupied ? "bg-green-600 hover:bg-green-700" : ""}>
            {station.isOccupied ? "In Use" : "Available"}
          </Badge>
        </div>
        
        <CardTitle className="text-xl mt-2 mb-0 font-bold">
          {station.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 pb-2">
        <div className="text-sm text-muted-foreground flex items-center justify-between">
          <span>Hourly Rate:</span>
          <span className="font-semibold">₹{station.hourlyRate}</span>
        </div>
        
        {station.isOccupied && station.currentSession && (
          <div className="mt-2">
            <StationInfo station={station} />
            <div className="mt-2">
              <StationTimer 
                startTime={station.currentSession.startTime} 
                hourlyRate={station.hourlyRate} 
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-2">
        <StationActions 
          station={station} 
          customers={customers}
          onStartSession={startSession}
          onEndSession={endSession}
        />
      </CardFooter>
      
      <EditStationDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        station={station}
      />
    </Card>
  );
};

export default StationCard;
