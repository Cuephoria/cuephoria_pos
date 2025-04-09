import React, { useState, useEffect, useRef } from 'react';
import { Station, Customer } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { isMembershipActive, formatHoursAsDuration, secondsToHours } from '@/utils/membership.utils';

interface StationTimerProps {
  station: Station;
}

const StationTimer: React.FC<StationTimerProps> = ({ station }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [projectedHoursUsed, setProjectedHoursUsed] = useState<number>(0);
  const [remainingMembershipHours, setRemainingMembershipHours] = useState<number | undefined>(undefined);
  
  const { toast } = useToast();
  const { customers, updateCustomer } = usePOS();
  
  const timerRef = useRef<number | null>(null);
  const sessionDataRef = useRef<{
    sessionId: string;
    startTime: Date;
    stationId: string;
    customerId: string;
    hourlyRate: number;
  } | null>(null);
  
  // Current customer data
  const customer = customers.find(c => c.id === station.currentSession?.customerId);
  const isMember = customer ? isMembershipActive(customer) : false;
  const hasHours = customer?.membershipHoursLeft !== undefined && customer.membershipHoursLeft > 0;

  useEffect(() => {
    if (!station.isOccupied || !station.currentSession) {
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setCost(0);
      setTotalElapsedSeconds(0);
      setProjectedHoursUsed(0);
      setRemainingMembershipHours(undefined);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      sessionDataRef.current = null;
      return;
    }

    // Store the session data in ref to maintain persistence across renders
    if (station.currentSession && !sessionDataRef.current) {
      sessionDataRef.current = {
        sessionId: station.currentSession.id,
        startTime: new Date(station.currentSession.startTime),
        stationId: station.id,
        customerId: station.currentSession.customerId,
        hourlyRate: station.hourlyRate
      };
    }

    // Initial calculation based on local session data
    const updateTimerFromLocalData = () => {
      if (!sessionDataRef.current) return;
      
      const startTime = sessionDataRef.current.startTime;
      const now = new Date();
      const elapsedMs = now.getTime() - startTime.getTime();
      
      // Calculate total seconds, minutes, hours
      const secondsTotal = Math.floor(elapsedMs / 1000);
      setTotalElapsedSeconds(secondsTotal);
      
      const minutesTotal = Math.floor(secondsTotal / 60);
      const hoursTotal = Math.floor(minutesTotal / 60);
      
      setSeconds(secondsTotal % 60);
      setMinutes(minutesTotal % 60);
      setHours(hoursTotal);
      
      // Calculate projected hours used (for membership deduction)
      const hoursElapsed = elapsedMs / (1000 * 60 * 60);
      const hoursDeducted = secondsToHours(secondsTotal); 
      setProjectedHoursUsed(hoursDeducted);
      
      // Update the customer's displayed remaining hours in real-time
      // This is just for display - actual deduction happens at session end
      if (customer && isMember && hasHours && customer.membershipHoursLeft !== undefined) {
        const tempRemainingHours = Math.max(0, customer.membershipHoursLeft - hoursDeducted);
        setRemainingMembershipHours(tempRemainingHours);
      }
      
      // Calculate cost based on hourly rate
      let calculatedCost = Math.ceil(hoursElapsed * station.hourlyRate);
      
      // Apply 50% discount for members
      if (isMember) {
        calculatedCost = Math.ceil(calculatedCost * 0.5); // 50% discount
      }
      
      setCost(calculatedCost);
    };

    // Try to get session data from Supabase
    const fetchSessionData = async () => {
      try {
        if (!station.currentSession) return;
        
        const sessionId = station.currentSession.id;
        console.log("Fetching session data for ID:", sessionId);
        
        const { data, error } = await supabase
          .from('sessions')
          .select('start_time')
          .eq('id', sessionId)
          .single();
          
        if (error) {
          console.error("Error fetching session data:", error);
          // Fallback to local data
          updateTimerFromLocalData();
          return;
        }
        
        if (data && data.start_time) {
          const startTime = new Date(data.start_time);
          console.log("Session start time from Supabase:", startTime);
          
          // Update the sessionDataRef with data from Supabase
          if (sessionDataRef.current) {
            sessionDataRef.current.startTime = startTime;
          } else {
            sessionDataRef.current = {
              sessionId,
              startTime,
              stationId: station.id,
              customerId: station.currentSession.customerId,
              hourlyRate: station.hourlyRate
            };
          }
          
          updateTimerFromLocalData();
        } else {
          // Fallback to local data
          updateTimerFromLocalData();
        }
      } catch (error) {
        console.error("Error in fetchSessionData:", error);
        // Fallback to local data
        updateTimerFromLocalData();
      }
    };
    
    // Fetch data initially
    fetchSessionData();
    
    // Set up interval for regular updates that persists
    if (timerRef.current === null) {
      timerRef.current = window.setInterval(() => {
        updateTimerFromLocalData();
      }, 1000);
    }
    
    // Clean up on unmount
    return () => {
      // Don't clear the interval - let the timer continue running
      // This is intentional to keep the session running in the background
    };
  }, [station, customers, customer, isMember, hasHours]);

  // Add a cleanup function for component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTimeDisplay = () => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!station.isOccupied || !station.currentSession) {
    return null;
  }

  // Show membership hours info if applicable
  const showMembershipHours = customer && 
    isMember && 
    customer.membershipHoursLeft !== undefined &&
    customer.membershipHoursLeft > 0;

  return (
    <div className="space-y-4 bg-black/70 p-3 rounded-lg">
      <div className="text-center">
        <span className="font-mono text-2xl bg-black px-4 py-2 rounded-lg text-white font-bold inline-block w-full">
          {formatTimeDisplay()}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-white">Current Cost:</span>
        <CurrencyDisplay amount={cost} className="text-cuephoria-orange font-bold text-lg" />
      </div>
      
      {/* Show real-time membership hours usage for members */}
      {showMembershipHours && (
        <>
          <div className="flex justify-between items-center text-xs border-t border-gray-600 pt-2">
            <span className="text-white">Used so far:</span>
            <span className="text-amber-400 font-bold">
              {formatHoursAsDuration(projectedHoursUsed)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white">Hours remaining:</span>
            <span className="text-green-400 font-bold">
              {remainingMembershipHours !== undefined ? 
                formatHoursAsDuration(remainingMembershipHours) : 
                formatHoursAsDuration(customer?.membershipHoursLeft || 0)}
            </span>
          </div>
          <div className="text-xs text-right text-green-500">
            50% discount applied
          </div>
        </>
      )}
    </div>
  );
};

export default StationTimer;
