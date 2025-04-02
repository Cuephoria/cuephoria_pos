
import { useState, useEffect } from 'react';
import { Station, Session, Customer } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

export const useStations = (
  initialStations: Station[], 
  updateCustomer: (customer: Customer) => void
) => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Load data from localStorage
  useEffect(() => {
    const storedStations = localStorage.getItem('cuephoriaStations');
    if (storedStations) setStations(JSON.parse(storedStations));
    
    const storedSessions = localStorage.getItem('cuephoriaSessions');
    if (storedSessions) setSessions(JSON.parse(storedSessions));
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cuephoriaStations', JSON.stringify(stations));
  }, [stations]);
  
  useEffect(() => {
    localStorage.setItem('cuephoriaSessions', JSON.stringify(sessions));
  }, [sessions]);
  
  const startSession = (stationId: string, customerId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (!station || station.isOccupied) return;
    
    const newSession = {
      id: generateId(),
      stationId,
      customerId,
      startTime: new Date(),
    };
    
    setSessions([...sessions, newSession]);
    
    setStations(stations.map(s => 
      s.id === stationId 
        ? { ...s, isOccupied: true, currentSession: newSession } 
        : s
    ));
  };
  
  const endSession = (stationId: string, customers: Customer[]) => {
    console.log("Ending session for station:", stationId);
    const station = stations.find(s => s.id === stationId);
    if (!station || !station.isOccupied || !station.currentSession) {
      console.log("No active session found for this station");
      return;
    }
    
    const endTime = new Date();
    const startTime = new Date(station.currentSession.startTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    
    // Update the session
    const updatedSession = {
      ...station.currentSession,
      endTime,
      duration: durationMinutes
    };
    
    setSessions(sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    ));
    
    // Update the station
    setStations(stations.map(s => 
      s.id === stationId 
        ? { ...s, isOccupied: false, currentSession: null } 
        : s
    ));
    
    // Update customer's total play time
    const customer = customers.find(c => c.id === updatedSession.customerId);
    if (customer) {
      updateCustomer({
        ...customer,
        totalPlayTime: customer.totalPlayTime + durationMinutes
      });
    }
    
    // Create a cart item for the session
    const stationRate = station.hourlyRate;
    const hoursPlayed = durationMinutes / 60;
    const sessionCost = Math.ceil(hoursPlayed * stationRate);
    
    const sessionCartItem = {
      id: updatedSession.id,
      type: 'session' as const,
      name: `${station.name} (${durationMinutes} mins)`,
      price: sessionCost,
      quantity: 1
    };
    
    return { updatedSession, sessionCartItem, customer };
  };
  
  return {
    stations,
    setStations,
    sessions,
    setSessions,
    startSession,
    endSession
  };
};
