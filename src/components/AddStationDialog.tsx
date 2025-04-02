
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePOS } from '@/context/POSContext';
import { Station } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

interface AddStationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStationDialog: React.FC<AddStationDialogProps> = ({ open, onOpenChange }) => {
  const { addStation } = usePOS();
  const [stationName, setStationName] = useState('');
  const [stationType, setStationType] = useState<'ps5' | '8ball'>('ps5');
  const [hourlyRate, setHourlyRate] = useState('10');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stationName || !stationType || !hourlyRate) {
      // Show error
      return;
    }

    const newStation: Station = {
      id: generateId(),
      name: stationName,
      type: stationType,
      hourlyRate: parseFloat(hourlyRate),
      isOccupied: false,
      currentSession: null,
      status: 'available'
    };

    addStation(newStation);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setStationName('');
    setStationType('ps5');
    setHourlyRate('10');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text">Add New Gaming Station</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="stationName" className="text-sm font-medium">Station Name</label>
            <Input
              id="stationName"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="Enter station name"
              className="bg-cuephoria-dark border-cuephoria-lightpurple/30"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="stationType" className="text-sm font-medium">Station Type</label>
            <Select value={stationType} onValueChange={(value: 'ps5' | '8ball') => setStationType(value)}>
              <SelectTrigger className="bg-cuephoria-dark border-cuephoria-lightpurple/30">
                <SelectValue placeholder="Select station type" />
              </SelectTrigger>
              <SelectContent className="bg-cuephoria-dark border-cuephoria-lightpurple/30">
                <SelectItem value="ps5">PlayStation 5</SelectItem>
                <SelectItem value="8ball">8-Ball Table</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate ($)</label>
            <Input
              id="hourlyRate"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Enter hourly rate"
              type="number"
              min="0"
              step="0.01"
              className="bg-cuephoria-dark border-cuephoria-lightpurple/30"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-cuephoria-lightpurple/30 text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-cuephoria-lightpurple to-accent"
            >
              Add Station
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationDialog;
