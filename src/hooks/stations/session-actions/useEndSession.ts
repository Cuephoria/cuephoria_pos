
import { useState } from 'react';
import { Station, Customer, CartItem } from '@/types/pos.types';
import { calculateSessionDuration } from '@/utils/timeUtils';

export const useEndSession = (
  stations: Station[],
  setStations: React.Dispatch<React.SetStateAction<Station[]>>,
  sessions: any[],
  setSessions: React.Dispatch<React.SetStateAction<any[]>>,
  updateCustomer: (customer: Customer) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const endSession = async (stationId: string, customers: Customer[]): Promise<{
    sessionCartItem?: CartItem;
    customer?: Customer;
  } | undefined> => {
    setIsLoading(true);
    
    try {
      // Find the station
      const stationIndex = stations.findIndex(s => s.id === stationId);
      if (stationIndex === -1) {
        console.log("Station not found");
        throw new Error("Station not found");
      }
      
      const station = stations[stationIndex];
      
      // Check if there's an active session
      if (!station.isOccupied || !station.currentSession) {
        console.log("No active session found for this station");
        throw new Error("No active session found");
      }
      
      const session = station.currentSession;
      const endTime = new Date();
      const duration = calculateSessionDuration(new Date(session.startTime), endTime);
      
      // Find the customer
      const customer = customers.find(c => c.id === session.customerId);
      if (!customer) {
        console.log("Customer not found");
        throw new Error("Customer not found");
      }
      
      // Update the session with end time and duration
      const updatedSession = {
        ...session,
        endTime,
        duration
      };
      
      // Calculate the cost based on hourly rate and duration
      const hours = duration / 60; // Convert minutes to hours
      const sessionCost = station.hourlyRate * hours;
      
      // Create a cart item for the session
      const sessionCartItem: CartItem = {
        id: `session-${session.id}`,
        type: 'session',
        name: `${station.name} (${Math.floor(hours * 100) / 100} hrs)`,
        price: sessionCost,
        quantity: 1,
        total: sessionCost
      };
      
      // Update the customer's total play time
      const updatedCustomer = {
        ...customer,
        totalPlayTime: customer.totalPlayTime + duration
      };
      
      // Update the customer in the database/state
      updateCustomer(updatedCustomer);
      
      // Update the station to mark it as unoccupied
      const updatedStation = {
        ...station,
        isOccupied: false,
        currentSession: null
      };
      
      // Update the stations array
      const updatedStations = [...stations];
      updatedStations[stationIndex] = updatedStation;
      setStations(updatedStations);
      
      // Update the sessions array to include the ended session
      const updatedSessions = [...sessions, updatedSession];
      setSessions(updatedSessions);
      
      console.log(`Session ended for station ${station.name}`);
      
      return {
        sessionCartItem,
        customer: updatedCustomer
      };
      
    } catch (error) {
      console.error("Error ending session:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    endSession,
    isLoading
  };
};
