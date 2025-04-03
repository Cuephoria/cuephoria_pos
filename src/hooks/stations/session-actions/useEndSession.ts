
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
        console.log("No active session found for this station");
        return undefined;
      }
      
      const endTime = new Date();
      const startTime = new Date(station.currentSession.startTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      
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
        console.error('Error updating session:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to end session: ' + error.message,
          variant: 'destructive'
        });
        return undefined;
      }
      
      // Update the session in state with the correct type
      const updatedSession = {
        ...station.currentSession,
        endTime,
        duration: durationMinutes
      };
      
      setSessions(prev => prev.map(s => 
        s.id === updatedSession.id ? updatedSession : s
      ));
      
      // Update the station in state with the correct type
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, isOccupied: false, currentSession: null } 
          : s
      ));
      
      // Update station in Supabase
      await supabase
        .from('stations')
        .update({ is_occupied: false })
        .eq('id', stationId);
      
      // Update customer's total play time
      const customer = customers.find(c => c.id === updatedSession.customerId);
      if (customer) {
        updateCustomer({
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        });
      }
      
      // Create a cart item for the session with valid ID
      const cartItemId = generateId();
      const stationRate = station.hourlyRate;
      const hoursPlayed = durationMinutes / 60;
      const sessionCost = Math.ceil(hoursPlayed * stationRate);
      
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
        description: 'Failed to end session',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  return { endSession };
};
