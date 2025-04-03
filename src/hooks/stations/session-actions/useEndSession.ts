
import { Session, Station, Customer, SessionResult, CartItem } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { SessionActionsProps } from './types';
import React from 'react';
import { generateId } from '@/utils/pos.utils';

/**
 * Hook to provide session end functionality
 */
export const useEndSession = ({
  stations,
  setStations,
  sessions,
  setSessions,
  updateCustomer
}: SessionActionsProps) => {
  const { toast } = useToast();
  
  /**
   * End an active session
   */
  const endSession = async (stationId: string, customers: Customer[] = []): Promise<SessionResult | undefined> => {
    try {
      console.log("Ending session for station:", stationId);
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.error("No active session found for this station");
        toast({
          title: "Session Error",
          description: "No active session found for this station",
          variant: "destructive"
        });
        return undefined;
      }
      
      console.log("Found active session:", station.currentSession);
      
      const endTime = new Date();
      const startTime = new Date(station.currentSession.startTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      
      console.log("Session duration:", durationMinutes, "minutes");
      console.log("Session ID for update:", station.currentSession.id);
      
      // Update the session in Supabase
      const { data, error } = await supabase
        .from('sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: durationMinutes
        })
        .eq('id', station.currentSession.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating session in Supabase:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to end session: ' + error.message,
          variant: 'destructive'
        });
        return undefined;
      }
      
      console.log("Session updated in Supabase:", data);
      
      // Update the session in state
      const updatedSession = {
        ...station.currentSession,
        endTime,
        duration: durationMinutes
      };
      
      // Update sessions state
      console.log("Updating sessions state with ended session");
      setSessions(prev => prev.map(s => 
        s.id === updatedSession.id ? updatedSession : s
      ));
      
      // Update the station in state
      console.log("Updating stations state to mark station as available");
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, isOccupied: false, currentSession: null } 
          : s
      ));
      
      // Update station in Supabase
      console.log("Updating station in Supabase to mark as available");
      const { error: stationError } = await supabase
        .from('stations')
        .update({ is_occupied: false })
        .eq('id', stationId);
      
      if (stationError) {
        console.error('Error updating station in Supabase:', stationError);
        // Don't throw, as the session was already updated
      }
      
      // Update customer's total play time
      const customer = customers.find(c => c.id === updatedSession.customerId);
      if (customer) {
        console.log("Updating customer play time:", customer.name);
        const updatedCustomer = {
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        
        updateCustomer(updatedCustomer);
      }
      
      // Create a cart item for the session
      const cartItemId = generateId();
      console.log("Generated cart item ID:", cartItemId);
      
      const stationRate = station.hourlyRate;
      const hoursPlayed = durationMinutes / 60;
      const sessionCost = Math.ceil(hoursPlayed * stationRate);
      
      console.log("Session cost calculation:", { 
        durationMinutes, 
        hoursPlayed, 
        stationRate, 
        sessionCost 
      });
      
      const sessionCartItem: CartItem = {
        id: cartItemId,
        type: 'session',
        name: `${station.name} (${durationMinutes} mins)`,
        price: sessionCost,
        quantity: 1,
        total: sessionCost
      };
      
      toast({
        title: 'Success',
        description: 'Session ended successfully',
      });
      
      return { updatedSession, sessionCartItem, customer };
    } catch (error) {
      console.error('Error in endSession:', error);
      toast({
        title: 'Error',
        description: 'Failed to end session: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive'
      });
      return undefined; // Return undefined instead of throwing
    }
  };
  
  return { endSession };
};
