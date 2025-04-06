
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Station } from '@/context/POSContext';
import { LoadingSpinner } from './ui/loading-spinner';

interface EditStationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: Station | null;
  onSave: (stationId: string, name: string, hourlyRate: number) => Promise<boolean>;
}

const EditStationDialog: React.FC<EditStationDialogProps> = ({
  open,
  onOpenChange,
  station,
  onSave
}) => {
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Set initial values when dialog opens with station data
  React.useEffect(() => {
    if (station) {
      setName(station.name);
      setHourlyRate(station.hourlyRate.toString());
    }
  }, [station]);

  const handleSave = async () => {
    if (!station) return;
    
    setIsLoading(true);
    try {
      const success = await onSave(
        station.id,
        name,
        parseFloat(hourlyRate)
      );
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving station:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] ${station?.type === '8ball' ? 'border-green-500' : 'border-cuephoria-purple'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit {station?.type === '8ball' ? 'Pool Table' : 'PS5 Console'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name || !hourlyRate || isLoading}
            className={station?.type === '8ball' ? 'bg-green-600 hover:bg-green-700' : 'bg-cuephoria-purple hover:bg-cuephoria-purple/90'}
          >
            {isLoading ? <LoadingSpinner /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStationDialog;
