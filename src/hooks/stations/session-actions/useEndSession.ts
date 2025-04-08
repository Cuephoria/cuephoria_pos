
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
      
      // Calculate duration in minutes
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
            duration: durationMinutes
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
      const hoursPlayed = durationMs / (1000 * 60 * 60);
      let sessionCost = Math.ceil(hoursPlayed * stationRate);
      
      // Check if customer is a valid member with available hours
      let isMember = customer?.isMember || false;
      let hoursToDeduct = 0;
      let discountApplied = false;
      let membershipHoursUpdated = false;
      let updatedCustomer = customer;
      
      if (isMember && customer && customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft > 0) {
        // Check if membership is still valid
        if (customer.membershipExpiryDate && new Date(customer.membershipExpiryDate) >= new Date()) {
          // Calculate hours to deduct (round up to nearest hour)
          hoursToDeduct = Math.ceil(hoursPlayed);
          
          // Only deduct what's available
          if (hoursToDeduct > customer.membershipHoursLeft) {
            hoursToDeduct = customer.membershipHoursLeft;
          }
          
          // Apply 50% discount regardless of hours deducted
          discountApplied = true;
          const originalCost = sessionCost;
          sessionCost = Math.ceil(sessionCost * 0.5); // 50% discount
          
          // Update customer's membership hours
          const remainingHours = Math.max(0, customer.membershipHoursLeft - hoursToDeduct);
          updatedCustomer = {
            ...customer,
            membershipHoursLeft: remainingHours,
            totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
          };
          
          membershipHoursUpdated = true;
          
          console.log(`Applied 50% member discount: ${originalCost} → ${sessionCost}`);
          console.log(`Deducted ${hoursToDeduct} hours, ${remainingHours} hours left`);
          
          // Update the customer in state and database
          if (membershipHoursUpdated && updatedCustomer) {
            updateCustomer(updatedCustomer);
          }
          
          if (remainingHours === 0) {
            toast({
              title: "Membership Hours Depleted",
              description: `${updatedCustomer.name} has used all allocated hours in their membership plan`,
              variant: "warning"
            });
          } else if (remainingHours <= 2) {
            toast({
              title: "Low Membership Hours",
              description: `${updatedCustomer.name} has only ${remainingHours} hours left in their membership plan`,
              variant: "warning"
            });
          }
        } else {
          // Membership expired
          toast({
            title: "Membership Expired",
            description: `${customer.name}'s membership has expired`,
            variant: "warning"
          });
          
          // Update customer to mark membership as inactive
          updatedCustomer = {
            ...customer,
            isMember: false,
            totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
          };
          
          // Update the customer in state and database
          updateCustomer(updatedCustomer);
        }
      } else if (isMember && customer && (!customer.membershipHoursLeft || customer.membershipHoursLeft <= 0)) {
        toast({
          title: "No Membership Hours",
          description: `${customer.name} has no remaining hours in their membership plan`,
          variant: "warning"
        });
        
        // Update customer's play time
        updatedCustomer = {
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        updateCustomer(updatedCustomer);
      } else if (customer) {
        // Non-member, just update play time
        updatedCustomer = {
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        updateCustomer(updatedCustomer);
      }
      
      console.log("Session cost calculation:", { 
        stationRate, 
        durationMinutes,
        hoursPlayed,
        isMember,
        discountApplied,
        sessionCost,
        hoursDeducted: hoursToDeduct
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
      
      toast({
        title: 'Success',
        description: 'Session ended successfully',
      });
      
      return { 
        updatedSession, 
        sessionCartItem, 
        customer: updatedCustomer
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
