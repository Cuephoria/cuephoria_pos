
import { useState, useEffect } from 'react';
import { Station, Session, Customer, CartItem, SessionResult } from '@/types/pos.types';
import { useStations } from './stations';
import { useCustomerCarts } from './useCustomerCarts';
import { useToast } from './use-toast';

/**
 * This hook combines customer cart management with station management
 * to create a persistent multi-customer system
 */
export const useCustomerSessionsManager = (
  initialStations: Station[], 
  updateCustomer: (customer: Customer) => void
) => {
  const { toast } = useToast();
  const [initializedStations, setInitializedStations] = useState<Station[]>(initialStations);

  // Get station functionality from useStations
  const { 
    stations, 
    setStations, 
    startSession,
    endSession,
    deleteStation,
    updateStation,
    stationsLoading,
    stationsError,
    sessionsLoading,
    sessionsError,
    refreshStations,
    refreshSessions,
    isLoading
  } = useStations(initializedStations, updateCustomer);

  // Get customer carts functionality
  const {
    customerCarts,
    activeCustomerId,
    setActiveCustomerId,
    getCustomerCart,
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

  // Set initial stations when they change
  useEffect(() => {
    if (initialStations?.length > 0) {
      setInitializedStations(initialStations);
    }
  }, [initialStations]);

  // Modified end session to ensure session is added to the correct customer's cart
  const endCustomerSession = async (stationId: string, customersList?: Customer[]): Promise<SessionResult | undefined> => {
    try {
      // Find the station first
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.currentSession) {
        toast({
          title: "Error",
          description: "No active session found for this station",
          variant: "destructive"
        });
        return undefined;
      }

      // Get the customer ID from the session
      const customerId = station.currentSession.customerId;
      
      // End the session and get the result
      const result = await endSession(stationId, customersList);
      
      if (result && result.sessionCartItem && customerId) {
        console.log(`Adding session cart item to customer ${customerId}'s cart:`, result.sessionCartItem);
        
        // Add the session cart item to the customer's cart
        addToCustomerCart(customerId, {
          id: result.sessionCartItem.id,
          type: result.sessionCartItem.type,
          name: result.sessionCartItem.name,
          price: result.sessionCartItem.price,
          quantity: result.sessionCartItem.quantity,
          category: result.sessionCartItem.category
        });
        
        // Set the active customer to the one who just ended their session
        setActiveCustomerId(customerId);
        
        toast({
          title: "Session Added",
          description: `Session added to ${result.customer?.name || customerId}'s cart`
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error in endCustomerSession:", error);
      toast({
        title: "Error",
        description: "Failed to end session and add to customer cart",
        variant: "destructive"
      });
      return undefined;
    }
  };
  
  // Function to get cart for active customer or a specified customer
  const getCurrentCart = (customerId?: string): CartItem[] => {
    const id = customerId || activeCustomerId;
    if (!id) return [];
    
    const customerCart = getCustomerCart(id);
    return customerCart.cart;
  };
  
  return {
    // Station management
    stations,
    stationsLoading,
    stationsError,
    sessionsLoading,
    sessionsError,
    isLoading,
    startSession,
    endSession: endCustomerSession, // Use our modified version
    deleteStation,
    updateStation,
    refreshStations,
    refreshSessions,
    
    // Multi-customer cart management
    customerCarts,
    activeCustomerId,
    setActiveCustomerId,
    getCustomerCart,
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
