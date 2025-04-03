
import { useState } from 'react';
import { calculateSessionDuration } from '@/utils/timeUtils';
import { Station, Session, Customer, CartItem } from '@/types/pos.types';

export const useEndSession = (
  stations: Station[],
  setStations: React.Dispatch<React.SetStateAction<Station[]>>,
  sessions: Session[],
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
  updateCustomer: (customer: Customer) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  // We'll modify the endSession function to make it compatible with the expected signature
  // in POSFunctions.ts, which expects (stationId: string) => Promise<{sessionCartItem?, customer?}>
  const endSession = async (stationId: string): Promise<{ 
    sessionCartItem?: CartItem; 
    customer?: Customer;
  } | undefined> => {
    setIsLoading(true);
    try {
      // Store customers in a closure variable that we can access from the function body
      const customers: Customer[] = [];

      // Find the station
      const stationIndex = stations.findIndex((s) => s.id === stationId);
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

      // Find the customer (this will be handled by the POSProvider that has access to customers)
      const customer = customers.find((c) => c.id === session.customerId);
      if (!customer) {
        console.log("Customer not found in session action");
        // This is fine, the customer will be looked up in the POSProvider
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

      // We won't update the customer here since we don't have access to it
      // Instead, we'll return it to be handled by the caller

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
      
      // Return the cart item to be added to the cart
      return {
        sessionCartItem
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
