
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
      
      console.log("Found station for ending session:", station.name, "Type:", station.type);
      
      const session = station.currentSession;
      const endTime = new Date();
      
      // Calculate duration in minutes - ensure minimum 1 minute
      const startTime = new Date(session.startTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      
      // Check for paused time and adjust duration if needed
      let actualDurationMs = durationMs;
      
      // If there's a pause time, subtract it
      if (session.isPaused && session.pausedAt) {
        const pausedDuration = session.totalPausedTime || 0;
        actualDurationMs -= pausedDuration;
        console.log(`Adjustment for paused time: ${pausedDuration}ms subtracted from total duration`);
      }
      
      const durationMinutes = Math.max(1, Math.round(actualDurationMs / (1000 * 60)));
      
      console.log(`Session duration calculation for ${station.name} (${station.type}) station:`, {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        rawDurationMs: durationMs,
        adjustedDurationMs: actualDurationMs,
        durationMinutes,
        stationType: station.type,
      });
      
      // Create updated session object
      const updatedSession: Session = {
        ...session,
        endTime,
        duration: durationMinutes,
        // Ensure we keep track of any paused information
        isPaused: false, // Reset pause state when ending
        totalPausedTime: session.totalPausedTime || 0,
        status: 'completed'
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
            is_paused: false,
            total_paused_time: session.totalPausedTime || 0,
            status: 'completed'
          })
          .eq('id', session.id);
          
        if (sessionError) {
          console.error('Error updating session in Supabase:', sessionError);
          // Continue since local state is already updated
        } else {
          console.log("Successfully updated session in Supabase");
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
          } else {
            console.log("Successfully updated station in Supabase");
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
        console.log("Found customer for session:", customer.name, "ID:", customer.id);
      }
      
      // Generate cart item for the session
      const cartItemId = generateId();
      console.log("Generated cart item ID:", cartItemId);
      
      // Calculate session cost using hourly rate and accurate time calculation
      const stationRate = station.hourlyRate;
      const hoursPlayed = actualDurationMs / (1000 * 60 * 60); // Convert ms to hours for billing
      let sessionCost = Math.ceil(hoursPlayed * stationRate);
      
      // Apply 50% discount for members
      const isMember = customer?.isMember || false;
      const discountApplied = isMember;
      
      if (discountApplied) {
        const originalCost = sessionCost;
        sessionCost = Math.ceil(sessionCost * 0.5); // 50% discount
        console.log(`Applied 50% member discount: ${originalCost} → ${sessionCost}`);
      }
      
      console.log("Session cost calculation:", { 
        stationRate, 
        durationMinutes,
        stationType: station.type,
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
      
      // Update customer's total play time - CRITICAL FIX for 8-ball stations
      if (customer) {
        // Ensure totalPlayTime is always treated as a number
        const currentPlayTime = typeof customer.totalPlayTime === 'number' ? customer.totalPlayTime : 0;
        
        // Add duration minutes to the total play time
        const newPlayTime = currentPlayTime + durationMinutes;
        
        console.log(`Updating customer ${customer.name} play time:`, {
          customer_id: customer.id,
          previousPlayTime: currentPlayTime,
          sessionMinutes: durationMinutes, 
          stationType: station.type,
          newTotalPlayTime: newPlayTime
        });
        
        const updatedCustomer = {
          ...customer,
          totalPlayTime: newPlayTime
        };
        
        // Update both local state and Supabase
        console.log("About to update customer with new play time:", updatedCustomer);
        updateCustomer(updatedCustomer);
        
        // Also update in Supabase directly to ensure persistence
        try {
          console.log(`Directly updating customer ${customer.id} in Supabase with total play time: ${newPlayTime}`);
          const { data, error } = await supabase
            .from('customers')
            .update({ 
              total_play_time: newPlayTime
            })
            .eq('id', customer.id)
            .select();
            
          if (error) {
            console.error('Error directly updating customer play time in Supabase:', error);
          } else {
            console.log('Updated customer in Supabase successfully:', data);
          }
        } catch (error) {
          console.error('Error updating customer in Supabase:', error);
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
