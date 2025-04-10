
import { Session, Station, Customer, CartItem, SessionResult } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { SessionActionsProps } from './types';
import { generateId } from '@/utils/pos.utils';
import React from 'react';
import { formatHoursAsDuration, isMembershipActive, minutesToHours } from '@/utils/membership.utils';

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
      
      // Calculate duration in minutes
      const startTime = new Date(session.startTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      const durationSeconds = Math.floor(durationMs / 1000);
      
      console.log(`Session duration calculation: ${durationMs}ms = ${durationMinutes} minutes (${durationSeconds} seconds)`);
      
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
      
      // Try to update session in Supabase
      try {
        const { error: sessionError } = await supabase
          .from('sessions')
          .update({
            end_time: endTime.toISOString(),
            duration: durationMinutes,
            duration_seconds: durationSeconds
          })
          .eq('id', session.id);
          
        if (sessionError) {
          console.error('Error updating session in Supabase:', sessionError);
          // Continue since local state is already updated
        }
      } catch (supabaseError) {
        console.error('Error updating session in Supabase:', supabaseError);
        // Continue since local state is already updated
      }
      
      // Try to update station in Supabase
      try {
        // Check if stationId is a proper UUID format
        const dbStationId = stationId.includes('-') ? stationId : null;
        
        if (dbStationId) {
          const { error: stationError } = await supabase
            .from('stations')
            .update({ is_occupied: false })
            .eq('id', dbStationId);
          
          if (stationError) {
            console.error('Error updating station in Supabase:', stationError);
            // Continue since local state is already updated
          }
        } else {
          console.log("Skipping station update in Supabase due to non-UUID station ID");
        }
      } catch (supabaseError) {
        console.error('Error updating station in Supabase:', supabaseError);
        // Continue since local state is already updated
      }
      
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
      
      // Calculate session cost
      const stationRate = station.hourlyRate;
      const hoursPlayed = minutesToHours(durationMinutes); // Convert minutes to hours for billing
      let sessionCost = Math.ceil(hoursPlayed * stationRate);
      
      // Apply 50% discount for members - IMPORTANT: This is the key part for member discounts
      const isMember = customer?.isMember || false;
      const discountApplied = isMember && isMembershipActive(customer!);
      
      if (discountApplied) {
        const originalCost = sessionCost;
        sessionCost = Math.ceil(sessionCost * 0.5); // 50% discount
        console.log(`Applied 50% member discount: ${originalCost} → ${sessionCost}`);
      }
      
      console.log("Session cost calculation:", { 
        stationRate, 
        durationMinutes,
        hoursPlayed,
        isMember,
        discountApplied,
        sessionCost 
      });
      
      // Create cart item for the session with discount info in the name if applicable
      const sessionCartItem: CartItem = {
        id: cartItemId,
        name: `${station.name} (${customer?.name || 'Unknown Customer'})${discountApplied ? ' - Member 50% OFF' : ''}`,
        price: sessionCost,
        quantity: 1,
        total: sessionCost,
        type: 'session',
      };
      
      console.log("Created cart item for ended session:", sessionCartItem);
      
      // Update customer's total play time (even if membership hours were deducted in real-time)
      if (customer) {
        const updatedCustomer = {
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        
        // The membership hours were already being deducted in real-time by StationTimer
        // So we don't need to modify membershipHoursLeft here
        
        updateCustomer(updatedCustomer);
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
  
  /**
   * Restore hours if a session is deleted
   */
  const restoreSessionHours = async (session: Session, customer: Customer): Promise<Customer | undefined> => {
    try {
      if (!session.duration || !customer.isMember || customer.membershipHoursLeft === undefined) {
        return undefined;
      }
      
      // Calculate hours to restore (always round up to nearest hour)
      const minutesPlayed = session.duration;
      const hoursPlayed = minutesToHours(minutesPlayed);
      const hoursToRestore = Math.ceil(hoursPlayed);
      
      console.log(`Restoring ${hoursToRestore} hours for customer ${customer.name} from deleted session`);
      
      // Update customer's membership hours
      const updatedHours = customer.membershipHoursLeft + hoursToRestore;
      const updatedCustomer = {
        ...customer,
        membershipHoursLeft: updatedHours,
        totalPlayTime: Math.max(0, (customer.totalPlayTime || 0) - minutesPlayed)
      };
      
      // Update customer in state and database
      updateCustomer(updatedCustomer);
      
      toast({
        title: "Hours Restored",
        description: `${hoursToRestore} hours have been restored to ${customer.name}'s membership (${formatHoursAsDuration(updatedHours)} available)`,
      });
      
      return updatedCustomer;
    } catch (error) {
      console.error('Error restoring session hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore membership hours',
        variant: 'destructive'
      });
      return undefined;
    }
  };
  
  return { endSession, restoreSessionHours };
};
