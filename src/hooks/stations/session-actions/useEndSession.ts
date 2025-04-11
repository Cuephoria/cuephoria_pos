
import { Session, Station, Customer, CartItem, SessionResult } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { SessionActionsProps } from './types';
import { generateId } from '@/utils/pos.utils';
import { shouldDeductFromMembership, convertMinutesToMembershipHours } from '@/utils/membership.utils';
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
      
      // Check if we should deduct from membership or charge regular rate
      const isMember = customer?.isMember || false;
      let deductedFromMembership = false;
      let membershipHoursLeft = customer?.membershipHoursLeft;
      
      if (customer && shouldDeductFromMembership(customer)) {
        // Convert minutes to hours for membership tracking
        const hoursToDeduct = convertMinutesToMembershipHours(durationMinutes);
        
        if (customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft >= hoursToDeduct) {
          // Full session can be covered by membership hours
          membershipHoursLeft = parseFloat((customer.membershipHoursLeft - hoursToDeduct).toFixed(2));
          sessionCost = Math.ceil(sessionCost * 0.5); // 50% discount for members
          deductedFromMembership = true;
          
          // Update customer membership hours and membership play time
          const updatedCustomer = {
            ...customer,
            membershipHoursLeft: membershipHoursLeft,
            membershipPlayTime: (customer.membershipPlayTime || 0) + durationMinutes,
            totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
          };
          
          console.log("Updating customer with deducted hours:", updatedCustomer);
          updateCustomer(updatedCustomer);
        } else if (customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft > 0) {
          // Partial coverage - some hours available but not enough
          const partialCoverageRatio = customer.membershipHoursLeft / hoursToDeduct;
          const discountedAmount = sessionCost * 0.5 * partialCoverageRatio;
          const regularAmount = sessionCost * (1 - partialCoverageRatio);
          sessionCost = Math.ceil(discountedAmount + regularAmount);
          
          // Update customer to use all remaining hours
          const updatedCustomer = {
            ...customer,
            membershipHoursLeft: 0,
            membershipPlayTime: (customer.membershipPlayTime || 0) + Math.floor(customer.membershipHoursLeft * 60),
            totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
          };
          
          console.log("Updating customer with partially deducted hours:", updatedCustomer);
          updateCustomer(updatedCustomer);
          
          deductedFromMembership = true;
          
          toast({
            title: "Membership Hours Depleted",
            description: `${customer.name} has used all their membership hours. Regular rates now apply.`,
            variant: "warning"
          });
        } else {
          // No hours left but just update total play time
          const updatedCustomer = {
            ...customer,
            totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
          };
          updateCustomer(updatedCustomer);
        }
      } else if (customer && isMember) {
        // Member but not deducting from hours (maybe hours are empty)
        sessionCost = Math.ceil(sessionCost * 0.5); // Still apply discount
        
        // Update only total play time, not membership play time
        const updatedCustomer = {
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        updateCustomer(updatedCustomer);
      } else if (customer) {
        // Non-member, just update total play time
        const updatedCustomer = {
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
        deductedFromMembership,
        membershipHoursLeft,
        sessionCost 
      });
      
      // Create cart item for the session with membership info in the name
      const sessionCartItem: CartItem = {
        id: cartItemId,
        name: `${station.name} (${customer?.name || 'Unknown Customer'})${deductedFromMembership ? ' - Membership Hours Used' : isMember ? ' - Member 50% OFF' : ''}`,
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
