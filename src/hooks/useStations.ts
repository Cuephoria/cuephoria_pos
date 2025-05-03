import { useState, useEffect } from 'react';
import { Station, Session, Customer, CartItem } from '@/types/pos.types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';

export const useStations = (initialStations: Station[], updateCustomer: Function) => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [sessions, setSessions] = useState<Session[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('*');
          
        if (error) {
          console.error('Error fetching stations:', error);
          toast({
            title: 'Database Error',
            description: 'Failed to fetch stations from database',
            variant: 'destructive'
          });
          return;
        }
        
        if (data) {
          // Transform the data to match our Station type
          const transformedStations: Station[] = data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type as 'ps5' | '8ball',
            hourlyRate: item.hourly_rate,
            isOccupied: item.is_occupied,
            currentSession: null // Initialize with null, we'll fetch sessions separately
          }));
          
          setStations(transformedStations);
          
          // After fetching stations, fetch active sessions for those stations
          await fetchActiveSessions(transformedStations);
        }
      } catch (error) {
        console.error('Error in fetchStations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load stations',
          variant: 'destructive'
        });
      }
    };
    
    // Helper function to fetch active sessions for stations
    const fetchActiveSessions = async (stationsList: Station[]) => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .is('end_time', null); // Only get active sessions (end_time is null)
        
        if (error) {
          console.error('Error fetching active sessions:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const activeSessions: Session[] = data.map(item => ({
            id: item.id,
            stationId: item.station_id,
            customerId: item.customer_id,
            startTime: new Date(item.start_time),
            endTime: item.end_time ? new Date(item.end_time) : undefined,
            duration: item.duration
          }));
          
          // Update stations with their active sessions
          const updatedStations = stationsList.map(station => {
            const activeSession = activeSessions.find(s => s.stationId === station.id);
            return {
              ...station,
              isOccupied: !!activeSession,
              currentSession: activeSession || null
            };
          });
          
          setStations(updatedStations);
          setSessions(prev => [...prev, ...activeSessions]);
        }
      } catch (error) {
        console.error('Error fetching active sessions:', error);
      }
    };
    
    fetchStations();
  }, []);
  
  const startSession = async (stationId: string, customerId: string) => {
    try {
      const station = stations.find(s => s.id === stationId);
      
      if (!station) {
        console.log("Station not found");
        toast({
          title: 'Error',
          description: 'Station not found',
          variant: 'destructive'
        });
        return;
      }
      
      if (station.isOccupied) {
        console.log("Station is already occupied");
        toast({
          title: 'Error',
          description: 'Station is already occupied',
          variant: 'destructive'
        });
        return;
      }
      
      const now = new Date();
      
      const session: Session = {
        id: generateId(),
        stationId: stationId,
        customerId: customerId,
        startTime: now
      };
      
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          id: session.id,
          station_id: session.stationId,
          customer_id: session.customerId,
          start_time: session.startTime.toISOString()
        });
        
      if (sessionError) {
        console.error("Error inserting session:", sessionError);
        toast({
          title: 'Database Error',
          description: 'Failed to start session in database',
          variant: 'destructive'
        });
        return;
      }
      
      const updatedStation = {
        ...station,
        isOccupied: true,
        currentSession: session
      };
      
      const { error: stationError } = await supabase
        .from('stations')
        .update({ is_occupied: true })
        .eq('id', stationId);
        
      if (stationError) {
        console.error("Error updating station:", stationError);
        toast({
          title: 'Database Error',
          description: 'Failed to update station in database',
          variant: 'destructive'
        });
        return;
      }
      
      setStations(stations.map(s => s.id === stationId ? updatedStation : s));
      setSessions([...sessions, session]);
      
      toast({
        title: 'Success',
        description: 'Session started successfully',
      });
    } catch (error) {
      console.error("Error in startSession:", error);
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive'
      });
    }
  };
  
  const endSession = async (stationId: string, customersList: Customer[] = []): Promise<any> => {
    try {
      const station = stations.find(s => s.id === stationId);
      
      if (!station || !station.isOccupied || !station.currentSession) {
        console.log("No active session found for this station");
        throw new Error("No active session found");
      }
      
      const now = new Date();
      const startTime = new Date(station.currentSession.startTime);
      const durationMs = now.getTime() - startTime.getTime();
      const durationMinutes = Math.ceil(durationMs / (1000 * 60)); // Round up to nearest minute
      const durationHours = durationMinutes / 60;
      
      console.log(`Session ended with duration: ${durationMinutes} minutes (${durationHours} hours)`);
      
      // Create a completed session
      const updatedSession = {
        ...station.currentSession,
        endTime: now,
        duration: durationMinutes
      };
      
      // Update the session in the database
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({
          end_time: updatedSession.endTime.toISOString(),
          duration: updatedSession.duration
        })
        .eq('id', updatedSession.id);
        
      if (sessionError) {
        console.error("Error updating session:", sessionError);
      }
      
      // Update the station
      const updatedStation = {
        ...station,
        isOccupied: false,
        currentSession: null
      };
      
      // Update the station in the database
      const { error: stationError } = await supabase
        .from('stations')
        .update({ is_occupied: false })
        .eq('id', stationId);
        
      if (stationError) {
        console.error("Error updating station:", stationError);
      }
      
      // Update customer's total playtime - fixed to properly add minutes
      const customerId = updatedSession.customerId;
      const customer = customersList.find(c => c.id === customerId);
      
      if (customer) {
        // Convert existing totalPlayTime to minutes if it's stored as hours
        let currentPlayTimeMinutes = customer.totalPlayTime || 0;
        
        // Add the session duration in minutes
        const newTotalPlayTimeMinutes = currentPlayTimeMinutes + durationMinutes;
        
        const updatedCustomer = {
          ...customer,
          totalPlayTime: newTotalPlayTimeMinutes
        };
        
        // Update customer in the database
        const { error: customerError } = await supabase
          .from('customers')
          .update({ total_play_time: newTotalPlayTimeMinutes })
          .eq('id', customerId);
          
        if (customerError) {
          console.error("Error updating customer playtime:", customerError);
        } else {
          console.log(`Updated customer ${customer.name} playtime to ${newTotalPlayTimeMinutes} minutes`);
          await updateCustomer(updatedCustomer);
        }
      }
      
      // Calculate the price
      let price = (durationHours * station.hourlyRate);
      
      // Round to 2 decimal places
      price = Math.round(price * 100) / 100;
      
      // Check if customer is eligible for free hours
      let freeSession = false;
      if (customer && customer.isMember && customer.membershipHoursLeft !== undefined) {
        if (customer.membershipHoursLeft >= durationHours) {
          console.log(`Using ${durationHours} membership hours from customer ${customer.name}`);
          freeSession = true;
          
          // Deduct hours from membership
          const remainingHours = Math.max(0, customer.membershipHoursLeft - durationHours);
          
          const membershipUpdatedCustomer = {
            ...customer,
            membershipHoursLeft: remainingHours
          };
          
          // Update customer membership hours in the database
          const { error: membershipError } = await supabase
            .from('customers')
            .update({ membership_hours_left: remainingHours })
            .eq('id', customerId);
            
          if (membershipError) {
            console.error("Error updating customer membership hours:", membershipError);
          } else {
            console.log(`Updated customer ${customer.name} membership hours to ${remainingHours}`);
            await updateCustomer(membershipUpdatedCustomer);
          }
        }
      }
      
      // Create a cart item for the session
      const sessionCartItem: CartItem = {
        id: generateId(),
        type: 'session',
        name: `${station.type === 'ps5' ? 'PlayStation 5' : '8-Ball Pool'} (${durationHours.toFixed(1)} hours)`,
        price: freeSession ? 0 : station.hourlyRate,
        quantity: durationHours,
        total: freeSession ? 0 : price
      };
      
      // Update the stations list
      setStations(stations.map(s => s.id === stationId ? updatedStation : s));
      
      // Update the sessions list
      setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
      
      return {
        updatedSession,
        sessionCartItem,
        customer
      };
    } catch (error) {
      console.error("Error in endSession:", error);
      throw error;
    }
  };

  const deleteStation = async (stationId: string): Promise<boolean> => {
    try {
      // Check if the station exists
      const station = stations.find(s => s.id === stationId);
      if (!station) {
        toast({
          title: 'Error',
          description: 'Station not found',
          variant: 'destructive'
        });
        return false;
      }
      
      // Delete the station from the database
      const { error } = await supabase
        .from('stations')
        .delete()
        .eq('id', stationId);
        
      if (error) {
        console.error('Error deleting station:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete station',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update the local state
      setStations(stations.filter(s => s.id !== stationId));
      
      toast({
        title: 'Success',
        description: 'Station deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteStation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete station',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  const updateStation = async (stationId: string, name: string, hourlyRate: number): Promise<boolean> => {
    try {
      // Check if the station exists
      const station = stations.find(s => s.id === stationId);
      if (!station) {
        toast({
          title: 'Error',
          description: 'Station not found',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update the station in the database
      const { error } = await supabase
        .from('stations')
        .update({ name: name, hourly_rate: hourlyRate })
        .eq('id', stationId);
        
      if (error) {
        console.error('Error updating station:', error);
        toast({
          title: 'Error',
          description: 'Failed to update station',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update the local state
      setStations(stations.map(s => s.id === stationId ? { ...s, name: name, hourlyRate: hourlyRate } : s));
      
      toast({
        title: 'Success',
        description: 'Station updated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateStation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update station',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    stations,
    setStations,
    sessions,
    setSessions,
    startSession,
    endSession,
    deleteStation,
    updateStation
  };
};
