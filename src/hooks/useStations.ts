
import { useState, useEffect } from 'react';
import { Station } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

export function useStations(initialStations: Station[]) {
  const [stations, setStations] = useState<Station[]>(initialStations);
  
  // Load data from localStorage
  useEffect(() => {
    const storedStations = localStorage.getItem('cuephoriaStations');
    if (storedStations) {
      const parsedStations = JSON.parse(storedStations);
      // Ensure all stations have the status property
      const updatedStations = parsedStations.map((station: any) => ({
        ...station,
        status: station.status || (station.isOccupied ? 'occupied' : 'available')
      }));
      setStations(updatedStations);
    }
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cuephoriaStations', JSON.stringify(stations));
  }, [stations]);
  
  const addStation = (station: Station) => {
    setStations([...stations, station]);
  };
  
  const updateStation = (updatedStation: Station) => {
    setStations(stations.map(station => 
      station.id === updatedStation.id ? updatedStation : station
    ));
  };
  
  const removeStation = (id: string) => {
    setStations(stations.filter(station => station.id !== id));
  };
  
  const startSession = (stationId: string, customerId?: string) => {
    setStations(stations.map(station => {
      if (station.id === stationId) {
        return {
          ...station,
          isOccupied: true,
          status: 'occupied',
          currentSession: {
            startTime: Date.now(),
            customerId: customerId || null,
            customerName: customerId ? 'Customer' : 'Guest' // In a real app, look up the name
          }
        };
      }
      return station;
    }));
  };
  
  const endSession = (stationId: string) => {
    setStations(stations.map(station => {
      if (station.id === stationId) {
        return {
          ...station,
          isOccupied: false,
          status: 'available',
          currentSession: null
        };
      }
      return station;
    }));
  };
  
  return {
    stations,
    setStations,
    addStation,
    updateStation,
    removeStation,
    startSession,
    endSession
  };
}
