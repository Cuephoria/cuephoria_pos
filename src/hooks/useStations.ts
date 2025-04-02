
import { useState, useEffect } from 'react';
import { Station, StationStatus } from '@/types/pos.types';
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
        status: station.status || (station.isOccupied ? 'occupied' as StationStatus : 'available' as StationStatus)
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
          status: 'occupied' as StationStatus,
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
    // Find the station
    const station = stations.find(s => s.id === stationId);
    if (!station || !station.currentSession) return null;

    // Create a cart item for the session
    const sessionDuration = Date.now() - station.currentSession.startTime;
    const hoursUsed = Math.max(0.5, Math.ceil(sessionDuration / (1000 * 60 * 30)) / 2); // Round up to nearest 30 min
    
    const sessionCartItem = {
      id: generateId(),
      type: 'session',
      name: `${station.name} Session (${hoursUsed} hr)`,
      price: station.hourlyRate,
      quantity: hoursUsed,
      total: station.hourlyRate * hoursUsed
    };
    
    // Update the station status
    setStations(stations.map(s => {
      if (s.id === stationId) {
        return {
          ...s,
          isOccupied: false,
          status: 'available' as StationStatus,
          currentSession: null
        };
      }
      return s;
    }));
    
    return {
      sessionCartItem,
      // If there was a customer ID associated with the session, return it
      customer: station.currentSession.customerId ? { id: station.currentSession.customerId, name: station.currentSession.customerName } : null
    };
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
