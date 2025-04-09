
import { Session, Station, Customer, CartItem, SessionResult } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { SessionActionsProps } from './types';
import { generateId } from '@/utils/pos.utils';
import React from 'react';
import { formatHoursAsDuration, isMembershipActive, minutesToHours, secondsToHours } from '@/utils/membership.utils';

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
      
      // Calculate duration using precise timing
      const startTime = new Date(session.startTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationSeconds = Math.round(durationMs / 1000);
      const durationMinutes = Math.ceil(durationSeconds / 60);
      
      console.log(`Session duration calculation: ${durationMs}ms = ${durationSeconds}s = ${durationMinutes} minutes`);
      
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
      
      // Try to update session in Supabase with both end_time and duration
      try {
        const { error: sessionError } = await supabase
          .from('sessions')
          .update({
            end_time: endTime.toISOString(),
            duration: durationMinutes,
            duration_seconds: durationSeconds // Store exact seconds for precise calculations
          })
          .eq('id', session.id);
          
        if (sessionError) {
          console.error('Error updating session in Supabase:', sessionError);
          // Continue since local state is already updated
        } else {
          console.log('Successfully updated session in Supabase with duration:', durationMinutes);
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
      // Use precise seconds for cost calculation
      const hoursPlayed = secondsToHours(durationSeconds);
      let sessionCost = Math.ceil(hoursPlayed * stationRate);
      
      // Check if customer is a valid member with available hours
      let isMember = customer?.isMember || false;
      let hoursToDeduct = 0;
      let discountApplied = false;
      let membershipHoursUpdated = false;
      let updatedCustomer = customer;
      
      if (isMember && customer && isMembershipActive(customer) && customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft > 0) {
        // Use exact hours based on seconds for deduction
        hoursToDeduct = secondsToHours(durationSeconds);
        
        console.log(`Deducting ${hoursToDeduct.toFixed(6)} hours based on ${durationSeconds} seconds played`);
        
        // Only deduct what's available
        if (hoursToDeduct > customer.membershipHoursLeft) {
          hoursToDeduct = customer.membershipHoursLeft;
          console.log(`Limited deduction to available hours: ${hoursToDeduct}`);
        }
        
        // Apply 50% discount
        discountApplied = true;
        const originalCost = sessionCost;
        sessionCost = Math.ceil(sessionCost * 0.5); // 50% discount
        
        // Update customer's membership hours with precise deduction
        const remainingHours = Math.max(0, customer.membershipHoursLeft - hoursToDeduct);
        updatedCustomer = {
          ...customer,
          membershipHoursLeft: remainingHours,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        
        membershipHoursUpdated = true;
        
        console.log(`Applied 50% member discount: ${originalCost} → ${sessionCost}`);
        console.log(`Deducted ${hoursToDeduct.toFixed(6)} hours, ${remainingHours.toFixed(6)} hours left (${formatHoursAsDuration(remainingHours)})`);
        
        // Update the customer in state and database
        if (membershipHoursUpdated && updatedCustomer) {
          try {
            // Update customer in Supabase with precise membership hours and play time
            const { error: customerError } = await supabase
              .from('customers')
              .update({
                membership_hours_left: remainingHours,
                total_play_time: updatedCustomer.totalPlayTime
              })
              .eq('id', customer.id);
              
            if (customerError) {
              console.error('Error updating customer in Supabase:', customerError);
              toast({
                title: "Database Error",
                description: "Failed to update customer membership hours in database",
                variant: "destructive"
              });
            } else {
              console.log('Successfully updated customer membership hours in Supabase:', remainingHours);
            }
            
            updateCustomer(updatedCustomer);
          } catch (error) {
            console.error('Error updating customer membership hours:', error);
            // Still update the local state
            updateCustomer(updatedCustomer);
          }
        }
        
        if (remainingHours === 0) {
          toast({
            title: "Membership Hours Depleted",
            description: `${updatedCustomer.name} has used all allocated hours in their membership plan`,
            variant: "destructive"
          });
        } else if (remainingHours <= 2) {
          toast({
            title: "Low Membership Hours",
            description: `${updatedCustomer.name} has only ${formatHoursAsDuration(remainingHours)} left in their membership plan`,
            variant: "default"
          });
        }
      } else if (isMember && customer && (!isMembershipActive(customer) || !customer.membershipHoursLeft || customer.membershipHoursLeft <= 0)) {
        // Handle expired or depleted membership
        if (customer.membershipExpiryDate && new Date(customer.membershipExpiryDate) < new Date()) {
          toast({
            title: "Membership Expired",
            description: `${customer.name}'s membership has expired`,
            variant: "default"
          });
          
          // Update customer to mark membership as inactive if needed
          updatedCustomer = {
            ...customer,
            totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
          };
          
          // Update the customer in state and database
          try {
            const { error: customerError } = await supabase
              .from('customers')
              .update({
                total_play_time: updatedCustomer.totalPlayTime
              })
              .eq('id', customer.id);
              
            if (customerError) {
              console.error('Error updating customer play time in Supabase:', customerError);
            }
            
            updateCustomer(updatedCustomer);
          } catch (error) {
            console.error('Error updating customer play time:', error);
            updateCustomer(updatedCustomer);
          }
        } else {
          toast({
            title: "No Membership Hours",
            description: `${customer.name} has no remaining hours in their membership plan`,
            variant: "default"
          });
          
          // Update customer's play time
          updatedCustomer = {
            ...customer,
            totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
          };
          
          try {
            const { error: customerError } = await supabase
              .from('customers')
              .update({
                total_play_time: updatedCustomer.totalPlayTime
              })
              .eq('id', customer.id);
              
            if (customerError) {
              console.error('Error updating customer play time in Supabase:', customerError);
            }
            
            updateCustomer(updatedCustomer);
          } catch (error) {
            console.error('Error updating customer play time:', error);
            updateCustomer(updatedCustomer);
          }
        }
      } else if (customer) {
        // Non-member, just update play time
        updatedCustomer = {
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        
        try {
          const { error: customerError } = await supabase
            .from('customers')
            .update({
              total_play_time: updatedCustomer.totalPlayTime
            })
            .eq('id', customer.id);
            
          if (customerError) {
            console.error('Error updating customer play time in Supabase:', customerError);
          } else {
            console.log('Successfully updated customer play time in Supabase:', updatedCustomer.totalPlayTime);
          }
          
          updateCustomer(updatedCustomer);
        } catch (error) {
          console.error('Error updating customer play time:', error);
          updateCustomer(updatedCustomer);
        }
      }
      
      console.log("Session cost calculation:", { 
        stationRate, 
        durationSeconds,
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
  
  /**
   * Restore hours if a session is deleted
   */
  const restoreSessionHours = async (session: Session, customer: Customer): Promise<Customer | undefined> => {
    try {
      if (!session.duration || !customer.isMember || customer.membershipHoursLeft === undefined) {
        return undefined;
      }
      
      // Calculate hours to restore using exact time
      let hoursToRestore: number;
      
      // Try to get the exact duration in seconds from Supabase first
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('duration_seconds, duration')
          .eq('id', session.id)
          .single();
          
        if (error || !data) {
          console.log('Could not find exact duration seconds, using minutes:', session.duration);
          const minutesPlayed = session.duration;
          const secondsPlayed = minutesPlayed * 60;
          hoursToRestore = secondsToHours(secondsPlayed);
        } else {
          // If we have duration_seconds, use that for precise restoration
          if (data.duration_seconds) {
            hoursToRestore = secondsToHours(data.duration_seconds);
            console.log(`Using exact seconds (${data.duration_seconds}) for hour restoration: ${hoursToRestore}`);
          } else {
            // Fallback to minutes
            const minutesPlayed = data.duration || session.duration;
            const secondsPlayed = minutesPlayed * 60;
            hoursToRestore = secondsToHours(secondsPlayed);
            console.log(`Using minutes (${minutesPlayed}) for hour restoration: ${hoursToRestore}`);
          }
        }
      } catch (error) {
        console.error('Error fetching session duration:', error);
        // Fallback to the session object's duration
        const minutesPlayed = session.duration;
        const secondsPlayed = minutesPlayed * 60;
        hoursToRestore = secondsToHours(secondsPlayed);
      }
      
      // Round to 6 decimal places for accurate tracking
      hoursToRestore = parseFloat(hoursToRestore.toFixed(6));
      
      console.log(`Restoring ${hoursToRestore} hours for customer ${customer.name} from deleted session`);
      
      // Update customer's membership hours
      const updatedHours = customer.membershipHoursLeft + hoursToRestore;
      const updatedCustomer = {
        ...customer,
        membershipHoursLeft: updatedHours,
        totalPlayTime: Math.max(0, (customer.totalPlayTime || 0) - session.duration)
      };
      
      // Update customer in Supabase
      try {
        const { error } = await supabase
          .from('customers')
          .update({
            membership_hours_left: updatedHours,
            total_play_time: updatedCustomer.totalPlayTime
          })
          .eq('id', customer.id);
          
        if (error) {
          console.error('Error updating customer in Supabase:', error);
          toast({
            title: "Database Error",
            description: "Failed to restore membership hours in database",
            variant: "destructive"
          });
        } else {
          console.log('Successfully restored customer membership hours in Supabase:', updatedHours);
        }
      } catch (error) {
        console.error('Error updating customer membership hours:', error);
      }
      
      // Update customer in state and database
      updateCustomer(updatedCustomer);
      
      toast({
        title: "Hours Restored",
        description: `${hoursToRestore.toFixed(2)} hours have been restored to ${customer.name}'s membership (${formatHoursAsDuration(updatedHours)} available)`,
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
