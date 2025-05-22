
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
      
      // Important: Update station state early to prevent race conditions
      setStations(prev => prev.map(s => 
        s.id === stationId 
          ? { ...s, isOccupied: false, currentSession: null } 
          : s
      ));
      
      // Try to update session in Supabase with robust retry logic
      let sessionUpdateSuccess = false;
      let retries = 5; // Increase retries for better success rate
      
      while (retries > 0 && !sessionUpdateSuccess) {
        try {
          const { data, error: sessionError } = await supabase
            .from('sessions')
            .update({
              end_time: endTime.toISOString(),
              duration: durationMinutes,
              status: 'completed'  // Explicitly mark as completed
            })
            .eq('id', session.id)
            .select();
            
          if (sessionError) {
            console.error(`Error updating session in Supabase (retry ${6-retries}/5):`, sessionError);
            retries--;
            // Wait longer between retries
            if (retries > 0) await new Promise(r => setTimeout(r, 1000));
          } else {
            sessionUpdateSuccess = true;
            console.log('Successfully updated session in Supabase:', data);
          }
        } catch (supabaseError) {
          console.error(`Error updating session in Supabase (retry ${6-retries}/5):`, supabaseError);
          retries--;
          if (retries > 0) await new Promise(r => setTimeout(r, 1000));
        }
      }

      if (!sessionUpdateSuccess) {
        console.error('Failed to update session in Supabase after multiple retries');
        toast({
          title: 'Warning',
          description: 'Session ended locally but database update failed. Please try again.',
          variant: 'destructive'
        });
        // We throw an error to indicate failure
        throw new Error('Failed to update session in database after multiple retries');
      }
      
      // Try to update station in Supabase
      let stationUpdateSuccess = false;
      retries = 5; // Reset retries
      
      // Check if stationId is a proper UUID format
      const dbStationId = stationId.includes('-') ? stationId : null;
      
      if (dbStationId) {
        while (retries > 0 && !stationUpdateSuccess) {
          try {
            const { data, error: stationError } = await supabase
              .from('stations')
              .update({ 
                is_occupied: false
              })
              .eq('id', dbStationId)
              .select();
            
            if (stationError) {
              console.error(`Error updating station in Supabase (retry ${6-retries}/5):`, stationError);
              retries--;
              if (retries > 0) await new Promise(r => setTimeout(r, 1000));
            } else {
              stationUpdateSuccess = true;
              console.log('Successfully updated station in Supabase:', data);
            }
          } catch (supabaseError) {
            console.error(`Error updating station in Supabase (retry ${6-retries}/5):`, supabaseError);
            retries--;
            if (retries > 0) await new Promise(r => setTimeout(r, 1000));
          }
        }
        
        if (!stationUpdateSuccess) {
          console.warn('Failed to update station in Supabase after multiple retries');
          // We continue since session was updated successfully
        }
      } else {
        console.log("Skipping station update in Supabase due to non-UUID station ID");
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
      
      // Calculate session cost using hourly rate and accurate time calculation
      const stationRate = station.hourlyRate;
      const hoursPlayed = durationMinutes / 60; // Convert minutes to hours for billing
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
      
      // Update customer's total play time
      if (customer) {
        const updatedCustomer = {
          ...customer,
          totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
        };
        updateCustomer(updatedCustomer);
      }
      
      // Final verification - perform a double-check fetch to confirm session was properly updated
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', session.id)
          .single();
          
        if (verifyError || !verifyData) {
          console.error('Verification failed: Could not retrieve session data', verifyError);
          throw new Error('Session verification failed');
        }
        
        if (!verifyData.end_time || verifyData.status !== 'completed') {
          console.error('Verification failed: Session not properly marked as completed', verifyData);
          
          // One final attempt to fix the status directly
          const { error: finalUpdateError } = await supabase
            .from('sessions')
            .update({
              status: 'completed',
              end_time: endTime.toISOString(),
              duration: durationMinutes
            })
            .eq('id', session.id);
            
          if (finalUpdateError) {
            console.error('Final attempt to fix session status failed', finalUpdateError);
            throw new Error('Session completion verification failed');
          }
        }
        
        console.log('Session end verified successfully:', verifyData);
      } catch (verifyError) {
        console.error('Error during session verification:', verifyError);
        throw new Error('Session verification failed');
      }
      
      // Session has been fully updated and verified both locally and in database
      toast({
        title: 'Success',
        description: 'Session ended successfully',
      });
      
      // Return result with update status
      return { 
        updatedSession, 
        sessionCartItem, 
        customer,
        isFullyUpdated: true // We've verified it's fully updated
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
