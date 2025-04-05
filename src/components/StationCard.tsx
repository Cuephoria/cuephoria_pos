
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { usePOS, Station } from '@/context/POSContext';
import StationInfo from '@/components/station/StationInfo';
import StationTimer from '@/components/station/StationTimer';
import StationActions from '@/components/station/StationActions';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, X, Check, AlertTriangle } from 'lucide-react';
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
import { deleteStationByName } from '@/integrations/supabase/client';

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
  const [forceDeleteDialogOpen, setForceDeleteDialogOpen] = useState(false);

  const getCustomer = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const customer = station.currentSession 
    ? getCustomer(station.currentSession.customerId)
    : null;
    
  const customerName = customer ? customer.name : 'Unknown Customer';
  
  // Check if this is Console 3 - expanded patterns to catch more variations
  const isConsole3 = station.name.toLowerCase().includes('console 3') || 
                     station.name.toLowerCase().includes('console3') ||
                     (station.name.toLowerCase().includes('console') && station.name.includes('3'));

  const handleDirectDelete = async () => {
    if (station.isOccupied) {
      toast({
        title: 'Cannot Delete',
        description: 'Cannot delete an occupied station. End the current session first.',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      setDeleteInProgress(true);
      toast({
        title: 'Force Deleting Station',
        description: `Attempting to force delete ${station.name}...`,
      });
      
      // Try deleting directly by name first
      const result = await deleteStationByName(station.name);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        
        setTimeout(() => window.location.reload(), 1500);
        return true;
      } else {
        console.error("Direct deletion failed:", result.message);
        
        // If that fails and it's console 3, try force deleting any PS5 station with "3" in the name
        if (isConsole3) {
          toast({
            title: 'Attempting Alternative Method',
            description: 'Trying alternative deletion method for Console 3...',
          });
          
          const fallbackResult = await deleteStationByName("3");
          
          if (fallbackResult.success) {
            toast({
              title: 'Success',
              description: fallbackResult.message,
            });
            
            setTimeout(() => window.location.reload(), 1500);
            return true;
          } else {
            toast({
              title: 'Error',
              description: 'All deletion attempts failed. Please try manually removing it from the database.',
              variant: 'destructive'
            });
            return false;
          }
        } else {
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive'
          });
          return false;
        }
      }
    } catch (error) {
      console.error("Error in direct delete:", error);
      toast({
        title: 'Error',
        description: 'Failed to delete station. See console for details.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setDeleteInProgress(false);
      setDeleteDialogOpen(false);
      setForceDeleteDialogOpen(false);
    }
  };

  const handleDeleteStation = async () => {
    if (deleteInProgress) return false;
    
    if (isConsole3) {
      return await handleDirectDelete();
    }
    
    try {
      setDeleteInProgress(true);
      console.log("Delete station button clicked for:", station.name, station.id, "Type:", station.type);
      
      toast({
        title: "Deleting Station",
        description: `Attempting to delete ${station.name}...`,
      });
      
      if (!station.id) {
        toast({
          title: "Error",
          description: "Invalid station ID",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Station type before deletion:", station.type, 
                  "Is PS5:", station.type === 'ps5',
                  "Is 8ball:", station.type === '8ball');
      
      const result = await deleteStation(station.id);
      console.log("Delete station result:", result);
      
      if (result) {
        toast({
          title: "Success",
          description: `Station ${station.name} has been deleted`,
        });
        setDeleteDialogOpen(false);
        return true;
      } else {
        toast({
          title: "Delete Failed",
          description: `Failed to delete station ${station.name}. Please try again.`,
          variant: "destructive",
        });
        return false;
      }
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
        ${isConsole3 ? 'border-red-500 border-2 border-dashed' : ''}
      `}
      data-station-id={station.id}
      data-station-type={station.type}
      data-station-name={station.name}
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

            {/* Special force delete dialog for Console 3 */}
            {isConsole3 && (
              <AlertDialog open={forceDeleteDialogOpen} onOpenChange={setForceDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 shrink-0 bg-red-500 text-white hover:bg-red-600 animate-pulse"
                    disabled={station.isOccupied || deleteInProgress}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-red-500">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Force Delete Console 3</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will attempt to forcefully remove Console 3 using a direct database deletion. This is a last resort method.
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm font-medium">
                        Warning: This is an aggressive deletion that will bypass normal checks.
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDirectDelete}
                      disabled={deleteInProgress}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {deleteInProgress ? "Deleting..." : "Force Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

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
                    ${isConsole3 ? 'bg-red-500/20 text-red-300' : ''}
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
                      Type: {station.type}<br/>
                      Name: {station.name}
                    </div>
                    {isConsole3 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm font-medium">
                        This is a special deletion using direct method by name.
                        If this doesn't work, use the red warning button for force deletion.
                      </div>
                    )}
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
          {isConsole3 && !station.isOccupied && (
            <div className="text-xs p-2 rounded bg-red-500/20 text-red-300 mb-2 border border-red-500/30">
              <strong>Use the red warning button</strong> at the top to force delete this console
            </div>
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
