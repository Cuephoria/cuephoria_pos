
import React from 'react';
import { usePOS } from '@/context/POSContext';
import StationCard from '@/components/StationCard';

const Stations = () => {
  const { stations } = usePOS();
  
  // Separate stations by type
  const ps5Stations = stations.filter(station => station.type === 'ps5');
  const ballStations = stations.filter(station => station.type === '8ball');

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gaming Stations</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">PlayStation 5 Consoles</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ps5Stations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">8-Ball Tables</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ballStations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stations;
