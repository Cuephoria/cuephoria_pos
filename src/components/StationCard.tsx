
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { usePOS, Station } from '@/context/POSContext';
import StationInfo from '@/components/station/StationInfo';
import StationTimer from '@/components/station/StationTimer';
import StationActions from '@/components/station/StationActions';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2 } from 'lucide-react';
import EditStationDialog from './EditStationDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { customers, startSession, endSession, deleteStation, updateStation } = usePOS();
  const isPoolTable = station.type === '8ball';
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getCustomer = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const customer = station.currentSession 
    ? getCustomer(station.currentSession.customerId)
    : null;
    
  const customerName = customer ? customer.name : 'Unknown Customer';
    
  const handleDeleteStation = async () => {
    await deleteStation(station.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  return (
    <>
      <Card 
        className={`
          relative overflow-hidden card-hover animate-scale-in h-full rounded-xl
          ${station.isOccupied 
            ? customer?.isMember 
              ? 'border-green-500 bg-black/80' 
              : 'border-cuephoria-orange bg-black/80' 
            : isPoolTable 
              ? 'border-green-500 bg-gradient-to-b from-green-900/30 to-green-950/40' 
              : 'border-cuephoria-purple bg-gradient-to-b from-cuephoria-purple/20 to-black/50'
          }
        `}
      >
        {/* Visual elements to enhance the appearance */}
        {isPoolTable && (
          <>
            <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-300"></div>
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-300"></div>
            <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-300"></div>
            <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-300"></div>
            <div className="absolute w-full h-[1px] top-10 bg-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>
          </>
        )}
        
        {!isPoolTable && (
          <>
            <div className="absolute right-0 top-0 w-8 h-3 bg-cuephoria-lightpurple/20 rounded-bl-lg"></div>
            <div className="absolute w-full h-[1px] top-10 bg-gradient-to-r from-transparent via-cuephoria-lightpurple/30 to-transparent"></div>
            <div className="absolute left-4 bottom-3 w-1 h-1 rounded-full bg-cuephoria-orange animate-pulse-soft"></div>
            <div className="absolute left-7 bottom-3 w-1 h-1 rounded-full bg-cuephoria-lightpurple animate-pulse-soft delay-100"></div>
          </>
        )}

        {/* Membership indicator on top of card */}
        {station.isOccupied && customer && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-transparent to-transparent">
            <div className={`h-full ${customer.isMember ? 'bg-green-500' : 'bg-gray-500'} w-2/3 rounded-br-lg`}></div>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex justify-between items-center space-x-2">
            <div className="flex-grow">
              <StationInfo station={station} customerName={customerName} customerData={customer} />
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`
                  h-8 w-8 shrink-0 rounded-lg
                  ${isPoolTable 
                    ? 'text-green-300 hover:text-blue-500 hover:bg-green-950/50' 
                    : 'text-cuephoria-lightpurple hover:text-blue-500 hover:bg-cuephoria-purple/20'
                  }
                `}
                disabled={station.isOccupied}
                onClick={handleEditClick}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`
                      h-8 w-8 shrink-0 rounded-lg
                      ${isPoolTable 
                        ? 'text-green-300 hover:text-red-500 hover:bg-green-950/50' 
                        : 'text-cuephoria-lightpurple hover:text-destructive hover:bg-cuephoria-purple/20'
                      }
                    `}
                    disabled={station.isOccupied}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className={isPoolTable ? 'border-green-500 rounded-xl' : 'border-cuephoria-purple rounded-xl'}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Station</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {station.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteStation}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col space-y-2">
            {station.isOccupied && station.currentSession && (
              <StationTimer station={station} />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-2 pt-2">
          <StationActions 
            station={station}
            customers={customers}
            onStartSession={startSession}
            onEndSession={endSession}
          />
        </CardFooter>
      </Card>

      {/* Edit Station Dialog */}
      <EditStationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        station={station}
        onSave={updateStation}
      />
    </>
  );
};

export default StationCard;
