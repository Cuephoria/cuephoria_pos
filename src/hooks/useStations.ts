
import { useState, useEffect } from 'react';
import { Station, Session, Customer } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { generateId } from '@/utils/pos.utils';

export const useStations = (
  initialStations: Station[], 
  updateCustomer: (customer: Customer) => void
) => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Load data from Supabase
  useEffect(() => {
    const fetchStations = async () => {
      try {
        // First check if we already have stations in localStorage (for backward compatibility)
        const storedStations = localStorage.getItem('cuephoriaStations');
        if (storedStations) {
          const parsedStations = JSON.parse(storedStations);
          setStations(parsedStations);
          
          // Migrate localStorage data to Supabase
          for (const station of parsedStations) {
            await supabase.from('stations').upsert(
              {
                id: station.id,
                name: station.name,
                type: station.type,
                hourly_rate: station.hourlyRate,
                is_occupied: station.isOccupied
              },
              { onConflict: 'id' }
            );
          }
          
          // Clear localStorage after migration
          localStorage.removeItem('cuephoriaStations');
          return;
        }
        
        // Fetch stations from Supabase
        const { data, error } = await supabase
          .from('stations')
          .select('*');
          
        if (error) {
          console.error('Error fetching stations:', error);
          return;
        }
        
        // Transform data to match our Station type
        if (data) {
          const transformedStations = data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            hourlyRate: item.hourly_rate,
            isOccupied: item.is_occupied,
            currentSession: null
          }));
          
          setStations(transformedStations.length > 0 ? transformedStations : initialStations);
        } else {
          setStations(initialStations);
        }
      } catch (error) {
        console.error('Error in fetchStations:', error);
        // Fallback to initialStations
        setStations(initialStations);
      }
    };
    
    const fetchSessions = async () => {
      try {
        // First check if we already have sessions in localStorage (for backward compatibility)
        const storedSessions = localStorage.getItem('cuephoriaSessions');
        if (storedSessions) {
          const parsedSessions = JSON.parse(storedSessions);
          setSessions(parsedSessions);
          
          // Migrate localStorage data to Supabase
          for (const session of parsedSessions) {
            await supabase.from('sessions').upsert(
              {
                id: session.id,
                station_id: session.stationId,
                customer_id: session.customerId,
                start_time: session.startTime,
                end_time: session.endTime,
                duration: session.duration
              },
              { onConflict: 'id' }
            );
          }
          
          // Clear localStorage after migration
          localStorage.removeItem('cuephoriaSessions');
          return;
        }
        
        // Fetch sessions from Supabase
        const { data, error } = await supabase
          .from('sessions')
          .select('*');
          
        if (error) {
          console.error('Error fetching sessions:', error);
          return;
        }
        
        // Transform data to match our Session type
        if (data) {
          const transformedSessions = data.map(item => ({
            id: item.id,
            stationId: item.station_id,
            customerId: item.customer_id,
            startTime: new Date(item.start_time),
            endTime: item.end_time ? new Date(item.end_time) : undefined,
            duration: item.duration
          }));
          
          setSessions(transformedSessions);
          
          // Update stations with active sessions
          if (transformedSessions.length > 0) {
            const activeSessionsMap = new Map<string, Session>();
            transformedSessions.forEach(session => {
              if (!session.endTime) {
                activeSessionsMap.set(session.stationId, session);
              }
            });
            
            setStations(prevStations => 
              prevStations.map(station => {
                const activeSession = activeSessionsMap.get(station.id);
                return activeSession
                  ? { ...station, isOccupied: true, currentSession: activeSession }
                  : station;
              })
            );
          }
        }
      } catch (error) {
        console.error('Error in fetchSessions:', error);
      }
    };
    
    fetchStations();
    fetchSessions();
  }, [initialStations]);
  
  const startSession = async (stationId: string, customerId: string) => {
    try {
      const station = stations.find(s => s.id === stationId);
      if (!station || station.isOccupied) return;
      
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
        return;
      }
      
      if (data) {
        const newSession: Session = {
          id: data.id,
          stationId,
          customerId,
          startTime
        };
        
        // Update sessions state
        setSessions([...sessions, newSession]);
        
        // Update station state
        setStations(stations.map(s => 
          s.id === stationId 
            ? { ...s, isOccupied: true, currentSession: newSession } 
            : s
        ));
        
        // Update station in Supabase
        await supabase
          .from('stations')
          .update({ is_occupied: true })
          .eq('id', stationId);
      }
    } catch (error) {
      console.error('Error in startSession:', error);
    }
  };
  
  const endSession = async (stationId: string, customers: Customer[]) => {
    try {
      console.log("Ending session for station:", stationId);
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.log("No active session found for this station");
        return;
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
        return;
      }
      
      // Update the session in state
      const updatedSession = {
        ...station.currentSession,
        endTime,
        duration: durationMinutes
      };
      
      setSessions(sessions.map(s => 
        s.id === updatedSession.id ? updatedSession : s
      ));
      
      // Update the station in state
      setStations(stations.map(s => 
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
          totalPlayTime: customer.totalPlayTime + durationMinutes
        });
      }
      
      // Create a cart item for the session
      const stationRate = station.hourlyRate;
      const hoursPlayed = durationMinutes / 60;
      const sessionCost = Math.ceil(hoursPlayed * stationRate);
      
      const sessionCartItem = {
        id: updatedSession.id,
        type: 'session' as const,
        name: `${station.name} (${durationMinutes} mins)`,
        price: sessionCost,
        quantity: 1,
        total: sessionCost
      };
      
      return { updatedSession, sessionCartItem, customer };
    } catch (error) {
      console.error('Error in endSession:', error);
      return undefined;
    }
  };
  
  return {
    stations,
    setStations,
    sessions,
    setSessions,
    startSession,
    endSession
  };
};
