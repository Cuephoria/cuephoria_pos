
import { Session, Station, Customer, CartItem, SessionResult } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { SessionActionsProps } from './session-actions/types';
import { generateId } from '@/utils/pos.utils';
import React from 'react';

/**
 * Hook to provide session end functionality
 */
export const useEndSession = ({
  stations,
  setStations,
  sessions,
  setSessions,
  updateCustomer
}: SessionActionsProps & { updateCustomer: (customer: Customer) => void }) => {
  const { toast } = useToast();
  
  /**
   * End an active session for a station
   */
  const endSession = async (stationId: string, customersList?: Customer[]): Promise<SessionResult | undefined> => {
    try {
      console.log("Ending session for station:", stationId);
      
      // Find the station
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.error("No active session found for this station");
        toast({
          title: "Session Error",
          description: "No active session found for this station",
          variant: "destructive"
        });
        throw new Error("No active session found");
      }
      
      const session = station.currentSession;
      const endTime = new Date();
      
      // Calculate duration in minutes - ensure minimum 1 minute
      const startTime = new Date(session.startTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));
      
      console.log(`Session duration calculation: ${durationMs}ms = ${durationMinutes} minutes`);
      
      // Create updated session object
      const updatedSession: Session = {
        ...session,
        endTime,
        duration: durationMinutes
      };
      
      console.log("Updated session with end time and duration:", updatedSession);
      
      // Update local state immediately for UI responsiveness
      setSessions(prev => prev.map(s => 
        s.id === session.id ? updatedSession : s
      ));
      
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, isOccupied: false, currentSession: null } 
          : s
      ));
      
      // Calculate the cost based on hourly rate and duration
      const hourlyRate = station.hourlyRate;
      const hours = durationMinutes / 60;
      
      // Create a cart item for the session
      const stationName = station.name;
      const price = Math.ceil(hours * hourlyRate);
      
      // Apply member discount if applicable
      let customer = undefined;
      let isMember = false;
      let finalPrice = price;
      
      if (customersList) {
        customer = customersList.find(c => c.id === session.customerId);
        if (customer) {
          isMember = customer.isMember || false;
          
          // Apply 50% discount for members
          if (isMember) {
            finalPrice = Math.ceil(price * 0.5);
          }
          
          // Update customer's total play time
          const updatedCustomer: Customer = {
            ...customer,
            totalPlayTime: customer.totalPlayTime + durationMinutes
          };
          
          console.log(`Updating customer ${customer.name} play time from ${customer.totalPlayTime} to ${updatedCustomer.totalPlayTime} minutes`);
          
          // Update customer in database
          try {
            const { error } = await supabase
              .from('customers')
              .update({ total_play_time: updatedCustomer.totalPlayTime })
              .eq('id', customer.id);
              
            if (error) {
              console.error('Error updating customer play time:', error);
            } else {
              console.log('Successfully updated customer play time in database');
            }
          } catch (error) {
            console.error('Error updating customer play time:', error);
          }
          
          updateCustomer(updatedCustomer);
        }
      }
      
      const sessionCartItem: CartItem = {
        id: session.id,
        type: 'session',
        name: `${stationName} - ${durationMinutes} mins`,
        price: finalPrice,
        quantity: 1,
        total: finalPrice
      };
      
      console.log("Created session cart item:", sessionCartItem);
      
      return {
        updatedSession,
        sessionCartItem,
        customer
      };
    } catch (error) {
      console.error("Error in endSession:", error);
      return undefined;
    }
  };
  
  return {
    endSession
  };
};
