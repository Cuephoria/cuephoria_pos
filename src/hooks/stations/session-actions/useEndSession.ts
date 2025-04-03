
import { Session, Station, Customer, CartItem, SessionResult } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { SessionActionsProps } from './types';
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
      
      // Calculate duration in minutes - local calculation
      const startTime = new Date(session.startTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      
      // Create updated session object
      const updatedSession: Session = {
        ...session,
        endTime,
        duration: durationMinutes
      };
      
      console.log("Updated session with end time and duration:", updatedSession);
      
      // Try to update session in Supabase, but don't let it block us if it fails
      try {
        const { error: sessionError } = await supabase
          .from('sessions')
          .update({
            end_time: endTime.toISOString(),
            duration: durationMinutes
          })
          .eq('id', session.id);
          
        if (sessionError) {
          console.error('Error updating session in Supabase:', sessionError);
          // Don't throw here, just log the error and continue
        }
        
        // Try to update station in Supabase
        const { error: stationError } = await supabase
          .from('stations')
          .update({ is_occupied: false })
          .eq('id', stationId);
        
        if (stationError) {
          console.error('Error updating station in Supabase:', stationError);
          // Don't throw here, just log the error and continue
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        // Continue with local state updates even if Supabase fails
      }
      
      // Update local state regardless of Supabase connectivity
      setSessions(prev => prev.map(s => 
        s.id === session.id ? updatedSession : s
      ));
      
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, isOccupied: false, currentSession: null } 
          : s
      ));
      
      // Find customer
      const customer = customersList?.find(c => c.id === session.customerId);
      
      if (!customer) {
        console.warn("Customer not found for session", session.customerId);
      } else {
        console.log("Found customer for session:", customer.name);
      }
      
      // Generate cart item for the session
      const cartItemId = generateId();
      console.log("Generated cart item ID:", cartItemId);
      
      // Calculate session cost - local calculation
      const stationRate = station.hourlyRate;
      const hoursPlayed = durationMinutes / 60;
      const sessionCost = Math.ceil(hoursPlayed * stationRate);
      
      console.log("Session cost calculation:", { 
        stationRate, 
        durationMinutes, 
        hoursPlayed, 
        sessionCost 
      });
      
      // Create cart item for the session
      const sessionCartItem: CartItem = {
        id: cartItemId,
        name: `${station.name} (${customer?.name || 'Unknown Customer'})`,
        price: stationRate,
        quantity: hoursPlayed,
        total: sessionCost,
        type: 'session',  // Using type instead of itemType to match CartItem interface
      };
      
      console.log("Created cart item for ended session:", sessionCartItem);
      
      // Update customer's total play time
      if (customer) {
        const updatedCustomer = {
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        
        // Try to update customer, but continue even if it fails
        try {
          updateCustomer(updatedCustomer);
        } catch (error) {
          console.error("Error updating customer:", error);
          // Continue even if customer update fails
        }
      }
      
      toast({
        title: 'Success',
        description: 'Session ended successfully',
      });
      
      return { 
        updatedSession, 
        sessionCartItem, 
        customer 
      };
    } catch (error) {
      console.error('Error in endSession:', error);
      toast({
        title: 'Error',
        description: 'Failed to end session: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive'
      });
      return undefined;
    }
  };
  
  return { endSession };
};
