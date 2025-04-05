import { Station, Session, Customer, SessionResult, CartItem } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';

export const useStationOperations = (
  stations: Station[],
  sessions: Session[],
  customers: Customer[]
) => {
  const { toast } = useToast();

  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    try {
      const station = stations.find(s => s.id === stationId);
      if (!station) {
        console.log("Station not found");
        throw new Error("Station not found");
      }
      
      if (station.isOccupied) {
        console.log("Station is already occupied");
        throw new Error("Station is already occupied");
      }
      
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        console.log("Customer not found");
        throw new Error("Customer not found");
      }
      
      // Create a new session
      const newSession: Session = {
        id: `session-${Date.now()}`,
        stationId: stationId,
        customerId: customerId,
        startTime: new Date()
      };
      
      // Update station status
      const updatedStation = {
        ...station,
        isOccupied: true,
        currentSession: newSession
      };
      
      // Here we would typically update the database
      console.log("Session started:", newSession);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in startSession:', error);
      throw error;
    }
  };

  const endSession = async (stationId: string): Promise<void> => {
    try {
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.log("No active session found for this station in wrapper");
        throw new Error("No active session found");
      }
      
      const customerId = station.currentSession.customerId;
      const customer = customers.find(c => c.id === customerId);
      
      if (!customer) {
        console.log("Customer not found for session");
        throw new Error("Customer not found for session");
      }
      
      // Calculate session duration
      const startTime = new Date(station.currentSession.startTime);
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      
      // Update session with end time and duration
      const updatedSession: Session = {
        ...station.currentSession,
        endTime,
        duration: durationMinutes
      };
      
      // Create cart item for the session
      const hourlyRate = station.hourlyRate;
      const hours = durationMinutes / 60;
      const sessionCost = hourlyRate * hours;
      
      const sessionCartItem: CartItem = {
        id: updatedSession.id,
        type: 'session',
        name: `${station.name} (${durationMinutes} mins)`,
        price: sessionCost,
        quantity: 1,
        total: sessionCost
      };
      
      // Update customer's total play time
      const updatedCustomer = {
        ...customer,
        totalPlayTime: (customer.totalPlayTime || 0) + durationMinutes
      };
      
      // Here we would typically update the database
      console.log("Session ended:", updatedSession);
      console.log("Updated customer:", updatedCustomer);
      
      const result: SessionResult = {
        updatedSession,
        sessionCartItem,
        customer: updatedCustomer
      };
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in endSession:', error);
      throw error;
    }
  };

  const deleteStation = async (stationId: string): Promise<boolean> => {
    try {
      const stationToDelete = stations.find(s => s.id === stationId);
      if (!stationToDelete) {
        console.log("Station not found");
        return false;
      }
      
      if (stationToDelete.isOccupied) {
        console.log("Cannot delete an occupied station");
        toast({
          title: "Cannot Delete Station",
          description: "This station is currently occupied. End the session before deleting.",
          variant: "destructive"
        });
        return false;
      }
      
      // Here we would typically delete from the database
      console.log("Station deleted:", stationId);
      
      return true;
    } catch (error) {
      console.error('Error in deleteStation:', error);
      return false;
    }
  };

  const deleteSession = async (sessionId: string): Promise<boolean> => {
    try {
      const sessionToDelete = sessions.find(s => s.id === sessionId);
      if (!sessionToDelete) {
        console.log("Session not found");
        return false;
      }
      
      // Check if session is active
      const associatedStation = stations.find(
        s => s.currentSession && s.currentSession.id === sessionId
      );
      
      if (associatedStation) {
        console.log("Cannot delete an active session");
        toast({
          title: "Cannot Delete Session",
          description: "This session is currently active. End the session before deleting.",
          variant: "destructive"
        });
        return false;
      }
      
      // Here we would typically delete from the database
      console.log("Session deleted:", sessionId);
      
      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      return false;
    }
  };

  return {
    startSession,
    endSession,
    deleteStation,
    deleteSession
  };
};
