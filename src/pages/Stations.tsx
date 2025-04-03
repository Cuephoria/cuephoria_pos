
import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import StationCard from '@/components/StationCard';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddStationDialog from '@/components/AddStationDialog';

const Stations = () => {
  const { stations } = usePOS();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  // Separate stations by type
  const ps5Stations = stations.filter(station => station.type === 'ps5');
  const ballStations = stations.filter(station => station.type === '8ball');

  // Count active stations
  const activePs5 = ps5Stations.filter(s => s.isOccupied).length;
  const activeBall = ballStations.filter(s => s.isOccupied).length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-gray-950 min-h-screen">
      <div className="flex items-center justify-between animate-slide-down">
        <h2 className="text-3xl font-bold tracking-tight gradient-text font-heading text-white">Gaming Stations</h2>
        <div className="flex space-x-2">
          <Button 
            className="bg-cuephoria-purple hover:bg-cuephoria-purple/80"
            onClick={() => setOpenAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Station
          </Button>
        </div>
      </div>

      {/* Add Station Dialog */}
      <AddStationDialog 
        open={openAddDialog} 
        onOpenChange={setOpenAddDialog} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
        <Card className="bg-gray-900 border-0 animate-fade-in">
          <CardContent className="p-4 flex items-center justify-between text-white">
            <div>
              <p className="text-sm text-gray-400">PlayStation 5</p>
              <p className="text-2xl font-bold">{activePs5} / {ps5Stations.length} Active</p>
            </div>
            <div className="rounded-full bg-cuephoria-purple/20 p-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 8.5L11 15L8.5 12.5" stroke="#9b87f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="#9b87f5" strokeWidth="1.5"/>
              </svg>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-0 animate-fade-in delay-100">
          <CardContent className="p-4 flex items-center justify-between text-white">
            <div>
              <p className="text-sm text-gray-400">8-Ball Tables</p>
              <p className="text-2xl font-bold">{activeBall} / {ballStations.length} Active</p>
            </div>
            <div className="rounded-full bg-cuephoria-orange/20 p-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#F97316" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="5" stroke="#F97316" strokeWidth="1.5"/>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="animate-slide-up delay-200">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold font-heading text-white">PlayStation 5 Consoles</h3>
            <span className="ml-2 bg-purple-900/40 text-purple-400 text-xs px-2 py-1 rounded-full">
              {activePs5} active
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ps5Stations.map((station, index) => (
              <div key={station.id} className={`animate-scale-in delay-${index * 100}`} style={{animationDelay: `${index * 100}ms`}}>
                <StationCard station={station} />
              </div>
            ))}
          </div>
        </div>

        <div className="animate-slide-up delay-300">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold font-heading text-white">8-Ball Tables</h3>
            <span className="ml-2 bg-orange-900/40 text-orange-400 text-xs px-2 py-1 rounded-full">
              {activeBall} active
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ballStations.map((station, index) => (
              <div key={station.id} className={`animate-scale-in delay-${index * 100 + 300}`} style={{animationDelay: `${index * 100 + 300}ms`}}>
                <StationCard station={station} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stations;
