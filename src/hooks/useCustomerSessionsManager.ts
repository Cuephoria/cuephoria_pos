
import { useState } from 'react';
import { useStations } from '@/hooks/useStations';
import { useCustomerCarts } from '@/hooks/useCustomerCarts';
import { Station, Customer, CartItem, Session, SessionResult } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';

export const useCustomerSessionsManager = (initialStations: Station[], updateCustomer: (customer: Customer) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Get station management functionality
  const {
    stations,
    setStations,
    startSession: startStationSession,
    endSession: endStationSession,
    deleteStation,
    updateStation
  } = useStations(initialStations, updateCustomer);
  
  // Get customer cart management functionality
  const {
    customerCarts,
    activeCustomerId,
    setActiveCustomerId,
    getCurrentCart,
    addToCustomerCart,
    removeFromCustomerCart,
    updateCustomerCartItem,
    clearCustomerCart,
    calculateCustomerCartTotal,
    setCustomerDiscount,
    setCustomerLoyaltyPointsUsed,
    setCustomerStudentDiscount,
    setCustomerSplitPayment,
    updateCustomerSplitAmounts,
  } = useCustomerCarts();
  
  // Start a session for a specific customer
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Start the session using the base station functionality
      await startStationSession(stationId, customerId);
      
      // Make sure this customer has a cart initialized
      setActiveCustomerId(customerId);
      
      console.log(`Session started for customer ${customerId} on station ${stationId}`);
    } catch (error) {
      console.error('Error starting session in customer session manager:', error);
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // End a session and add it to the correct customer's cart
  const endSession = async (stationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Find the station
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.currentSession) {
        throw new Error("No active session found for this station");
      }
      
      // Get the customer ID before ending the session
      const customerId = station.currentSession.customerId;
      console.log(`Ending session for customer ${customerId} on station ${stationId}`);
      
      // End the session
      const result = await endStationSession(stationId);
      
      // If we got a session cart item, add it to the customer's cart
      if (result && result.sessionCartItem) {
        console.log(`Adding session to customer ${customerId}'s cart:`, result.sessionCartItem);
        addToCustomerCart(customerId, result.sessionCartItem);
      }
    } catch (error) {
      console.error('Error ending session in customer session manager:', error);
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    // Station management
    stations,
    setStations,
    startSession,
    endSession,
    deleteStation,
    updateStation,
    
    // Multi-customer cart management
    customerCarts,
    activeCustomerId,
    setActiveCustomerId,
    getCurrentCart,
    addToCustomerCart,
    removeFromCustomerCart,
    updateCustomerCartItem,
    clearCustomerCart,
    calculateCustomerCartTotal,
    setCustomerDiscount,
    setCustomerLoyaltyPointsUsed,
    setCustomerStudentDiscount,
    setCustomerSplitPayment,
    updateCustomerSplitAmounts,
  };
};
