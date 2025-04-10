
import React, { useState, useEffect, useRef } from 'react';
import { Station } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { formatDurationFromSeconds } from '@/utils/membership.utils';

interface StationTimerProps {
  station: Station;
}

const StationTimer: React.FC<StationTimerProps> = ({ station }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const { toast } = useToast();
  const { customers, updateCustomer } = usePOS();
  const timerRef = useRef<number | null>(null);
  const lastDeductionRef = useRef<number>(0);
  const sessionDataRef = useRef<{
    sessionId: string;
    startTime: Date;
    stationId: string;
    customerId: string;
    hourlyRate: number;
  } | null>(null);

  useEffect(() => {
    if (!station.isOccupied || !station.currentSession) {
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setCost(0);
      setElapsedSeconds(0);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      sessionDataRef.current = null;
      lastDeductionRef.current = 0;
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

    // Find the customer to check if they are a member
    const customer = customers.find(c => c.id === station.currentSession?.customerId);
    const isMember = customer?.isMember || false;
    const hasMembershipSeconds = isMember && customer?.membershipSecondsLeft !== undefined && customer.membershipSecondsLeft > 0;

    // Initial calculation based on local session data
    const updateTimerFromLocalData = () => {
      if (!sessionDataRef.current) return;
      
      const startTime = sessionDataRef.current.startTime;
      const now = new Date();
      const elapsedMs = now.getTime() - startTime.getTime();
      const secondsTotal = Math.floor(elapsedMs / 1000);
      
      // Update elapsed seconds for real-time membership deduction
      setElapsedSeconds(secondsTotal);
      
      const minutesTotal = Math.floor(secondsTotal / 60);
      const hoursTotal = Math.floor(minutesTotal / 60);
      
      setSeconds(secondsTotal % 60);
      setMinutes(minutesTotal % 60);
      setHours(hoursTotal);
      
      // Calculate cost based on hourly rate
      const hoursElapsed = elapsedMs / (1000 * 60 * 60);
      let calculatedCost = Math.ceil(hoursElapsed * station.hourlyRate);
      
      // Apply 50% discount for members with valid membership hours
      if (isMember) {
        calculatedCost = Math.ceil(calculatedCost * 0.5); // 50% discount
      }
      
      setCost(calculatedCost);
    };

    // Handle real-time membership seconds deduction
    const handleMembershipDeduction = () => {
      if (!customer || !isMember || customer.membershipSecondsLeft === undefined) return;
      
      // Only deduct if a second has passed since last deduction
      if (elapsedSeconds > lastDeductionRef.current) {
        // Calculate seconds to deduct (current elapsed - last deduction point)
        const secondsToDeduct = elapsedSeconds - lastDeductionRef.current;
        
        // If customer has membership seconds left, deduct them
        if (customer.membershipSecondsLeft > 0) {
          // Don't let membership seconds go below zero
          const remainingSeconds = Math.max(0, customer.membershipSecondsLeft - secondsToDeduct);
          
          // Update the customer with new seconds left
          const updatedCustomer = {
            ...customer,
            membershipSecondsLeft: remainingSeconds
          };
          
          // Update customer in state
          updateCustomer(updatedCustomer);
          
          console.log(`Real-time deduction: ${secondsToDeduct}s, Remaining: ${formatDurationFromSeconds(remainingSeconds)}`);
          
          // If membership seconds just hit zero, show a toast
          if (customer.membershipSecondsLeft > 0 && remainingSeconds === 0) {
            toast({
              title: "Membership Hours Depleted",
              description: `${customer.name} has used all their membership hours`,
              variant: "warning"
            });
          }
        }
        
        // Update the last deduction point
        lastDeductionRef.current = elapsedSeconds;
      }
    };

    // Try to get session data from Supabase
    const fetchSessionData = async () => {
      try {
        if (!station.currentSession) return;
        
        const sessionId = station.currentSession.id;
        
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
        handleMembershipDeduction();
      }, 1000);
    }
    
    // Clean up on unmount
    return () => {
      // Don't clear the interval - let the timer continue running
      // This is intentional to keep the session running in the background
      // even if component unmounts
    };
  }, [station, customers, elapsedSeconds, updateCustomer, toast]);

  // Add a cleanup function for component unmount
  useEffect(() => {
    return () => {
      // This will only run when the component is truly unmounted (not page change)
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTimeDisplay = () => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get customer information for displaying membership hours left
  const customer = station.currentSession 
    ? customers.find(c => c.id === station.currentSession?.customerId)
    : null;

  if (!station.isOccupied || !station.currentSession) {
    return null;
  }

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
      
      {customer && customer.isMember && customer.membershipSecondsLeft !== undefined && (
        <div className="flex justify-between items-center">
          <span className="text-white text-sm">Hours Left:</span>
          <span className="text-green-400 font-mono">
            {formatDurationFromSeconds(customer.membershipSecondsLeft)}
          </span>
        </div>
      )}
    </div>
  );
};

export default StationTimer;
