
import { Station, Session, Customer, CartItem, SessionResult } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to provide session management actions
 */
export const useSessionActions = (
  stations: Station[],
  setStations: (stations: Station[]) => void,
  sessions: Session[],
  setSessions: (sessions: Session[]) => void,
  updateCustomer: (customer: Customer) => void
) => {
  const { toast } = useToast();
  
  /**
   * Start a new session for a station
   */
  const startSession = async (stationId: string, customerId: string): Promise<Session | undefined> => {
    try {
      const station = stations.find(s => s.id === stationId);
      if (!station || station.isOccupied) {
        throw new Error("Station not available or already occupied");
      }
      
      const startTime = new Date();
      
      // Create session in Supabase
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          station_id: stationId,
          customer_id: customerId,
          start_time: startTime.toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to start session',
          variant: 'destructive'
        });
        throw error;
      }
      
      if (data) {
        const newSession: Session = {
          id: data.id,
          stationId,
          customerId,
          startTime
        };
        
        // Update sessions state - fix the type error
        setSessions((prev: Session[]) => [...prev, newSession]);
        
        // Update station state - fix the type error
        setStations((prev: Station[]) => prev.map(s => 
          s.id === stationId 
            ? { ...s, isOccupied: true, currentSession: newSession } 
            : s
        ));
        
        // Update station in Supabase
        await supabase
          .from('stations')
          .update({ is_occupied: true })
          .eq('id', stationId);
        
        toast({
          title: 'Success',
          description: 'Session started successfully',
        });
        
        return newSession;
      }
      return undefined;
    } catch (error) {
      console.error('Error in startSession:', error);
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
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
          description: 'Failed to end session',
          variant: 'destructive'
        });
        return undefined;
      }
      
      // Update the session in state - fix the type error
      const updatedSession = {
        ...station.currentSession,
        endTime,
        duration: durationMinutes
      };
      
      setSessions((prev: Session[]) => prev.map(s => 
        s.id === updatedSession.id ? updatedSession : s
      ));
      
      // Update the station in state - fix the type error
      setStations((prev: Station[]) => prev.map(s => 
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
      
      // Create a cart item for the session
      const stationRate = station.hourlyRate;
      const hoursPlayed = durationMinutes / 60;
      const sessionCost = Math.ceil(hoursPlayed * stationRate);
      
      const sessionCartItem: CartItem = {
        id: updatedSession.id,
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
  
  return {
    startSession,
    endSession
  };
};
