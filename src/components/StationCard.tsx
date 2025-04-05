
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { usePOS, Station } from '@/context/POSContext';
import StationInfo from '@/components/station/StationInfo';
import StationTimer from '@/components/station/StationTimer';
import StationActions from '@/components/station/StationActions';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, X, Check } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { customers, startSession, endSession, deleteStation, updateStation } = usePOS();
  const { toast } = useToast();
  const isPoolTable = station.type === '8ball';
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: station.name,
    hourlyRate: station.hourlyRate
  });
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getCustomer = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const customer = station.currentSession 
    ? getCustomer(station.currentSession.customerId)
    : null;
    
  const customerName = customer ? customer.name : 'Unknown Customer';
    
  const handleDeleteStation = async () => {
    if (deleteInProgress) return false;
    
    try {
      setDeleteInProgress(true);
      console.log("Delete station button clicked for:", station.name, station.id);
      
      // Show deletion in progress toast
      toast({
        title: "Deleting Station",
        description: `Attempting to delete ${station.name}...`,
      });
      
      const result = await deleteStation(station.id);
      console.log("Delete station result:", result);
      
      if (result) {
        toast({
          title: "Success",
          description: `Station ${station.name} has been deleted`,
        });
        setDeleteDialogOpen(false);
      } else {
        toast({
          title: "Delete Failed",
          description: `Failed to delete station ${station.name}. Please try again.`,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error in handleDeleteStation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the station",
        variant: "destructive",
      });
      return false;
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedStation = {
        ...station,
        name: editData.name,
        hourlyRate: editData.hourlyRate
      };
      
      const result = await updateStation(updatedStation);
      
      if (result) {
        setEditDialogOpen(false);
      }
      
      return result;
    } catch (error) {
      console.error("Error updating station:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update station. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <Card 
      className={`
        relative overflow-hidden card-hover animate-scale-in h-full
        ${station.isOccupied 
          ? customer?.isMember 
            ? 'border-green-500 bg-black/80' 
            : 'border-cuephoria-orange bg-black/80' 
          : isPoolTable 
            ? 'border-green-500 bg-gradient-to-b from-green-900/30 to-green-950/40' 
            : 'border-cuephoria-purple bg-gradient-to-b from-cuephoria-purple/20 to-black/50'
        }
        ${isPoolTable ? 'rounded-xl' : 'rounded-lg'}
      `}
    >
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
          <div className="flex space-x-1">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`
                    h-8 w-8 shrink-0 
                    ${isPoolTable 
                      ? 'text-green-300 hover:text-blue-500 hover:bg-green-950/50' 
                      : 'text-cuephoria-lightpurple hover:text-blue-500 hover:bg-cuephoria-purple/20'
                    }
                  `}
                  disabled={station.isOccupied}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Station</DialogTitle>
                  <DialogDescription>
                    Make changes to the station settings here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hourlyRate" className="text-right">
                      Hourly Rate
                    </Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={editData.hourlyRate}
                      onChange={(e) => setEditData({...editData, hourlyRate: parseFloat(e.target.value) || 0})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleEditSubmit}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`
                    h-8 w-8 shrink-0 
                    ${isPoolTable 
                      ? 'text-green-300 hover:text-red-500 hover:bg-green-950/50' 
                      : 'text-cuephoria-lightpurple hover:text-destructive hover:bg-cuephoria-purple/20'
                    }
                  `}
                  disabled={station.isOccupied || deleteInProgress}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={isPoolTable ? 'border-green-500' : 'border-cuephoria-purple'}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Station</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {station.name}? This action cannot be undone.
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                      Station ID: {station.id}<br/>
                      Type: {station.type}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteStation}
                    disabled={deleteInProgress}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteInProgress ? "Deleting..." : "Delete"}
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
  );
};

export default StationCard;
