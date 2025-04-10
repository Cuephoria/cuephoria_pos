
import React, { useState, useEffect, useRef } from 'react';
import { Station, Customer } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';
import { isMembershipActive, formatSecondsAsDuration, secondsToHours } from '@/utils/membership.utils';

interface StationTimerProps {
  station: Station;
}

const StationTimer: React.FC<StationTimerProps> = ({ station }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [projectedHoursUsed, setProjectedHoursUsed] = useState<number>(0);
  const { toast } = useToast();
  const { customers, updateCustomer } = usePOS();
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const lastUpdateTimeRef = useRef<Date | null>(null);
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [membershipUpdated, setMembershipUpdated] = useState(false);

  useEffect(() => {
    // Find current customer based on session
    if (station.currentSession?.customerId) {
      const foundCustomer = customers.find(c => c.id === station.currentSession?.customerId);
      setCustomer(foundCustomer);
    }
  }, [station.currentSession, customers]);

  useEffect(() => {
    if (!station.isOccupied || !station.currentSession) {
      setElapsedSeconds(0);
      setCost(0);
      setProjectedHoursUsed(0);
      setMembershipUpdated(false);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      startTimeRef.current = null;
      lastUpdateTimeRef.current = null;
      return;
    }

    // Initialize timer with session start time
    const sessionStartTime = new Date(station.currentSession.startTime);
    startTimeRef.current = sessionStartTime;
    lastUpdateTimeRef.current = new Date();
    
    // Calculate initial elapsed time
    const now = new Date();
    const initialElapsedSeconds = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
    setElapsedSeconds(initialElapsedSeconds);

    // Try to get session data from Supabase for accurate timing
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
          return;
        }
        
        if (data && data.start_time) {
          const dbStartTime = new Date(data.start_time);
          console.log("Session start time from Supabase:", dbStartTime);
          startTimeRef.current = dbStartTime;
          
          const now = new Date();
          const updatedElapsedSeconds = Math.floor((now.getTime() - dbStartTime.getTime()) / 1000);
          setElapsedSeconds(updatedElapsedSeconds);
        }
      } catch (error) {
        console.error("Error in fetchSessionData:", error);
      }
    };
    
    fetchSessionData();

    // Set up interval for timer and real-time membership deduction
    if (timerRef.current === null) {
      timerRef.current = window.setInterval(() => {
        if (!startTimeRef.current) return;
        
        const now = new Date();
        const currentElapsedSeconds = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
        setElapsedSeconds(currentElapsedSeconds);
        
        // Calculate cost
        const hoursElapsed = currentElapsedSeconds / 3600;
        let calculatedCost = Math.ceil(hoursElapsed * station.hourlyRate);
        
        // Apply 50% discount for members
        if (customer && isMembershipActive(customer)) {
          calculatedCost = Math.ceil(calculatedCost * 0.5);
        }
        
        setCost(calculatedCost);
        
        // Calculate projected hours used (for membership deduction)
        const hoursUsed = Math.ceil(hoursElapsed);
        setProjectedHoursUsed(hoursUsed);
        
        // Update membership hours in real-time (every minute)
        if (customer && 
            isMembershipActive(customer) && 
            customer.membershipHoursLeft !== undefined && 
            customer.membershipHoursLeft > 0 &&
            lastUpdateTimeRef.current) {
          
          // Calculate seconds since last update
          const secondsSinceLastUpdate = Math.floor((now.getTime() - lastUpdateTimeRef.current.getTime()) / 1000);
          
          // Update every 1 second (for demo purposes - in production might be less frequent)
          if (secondsSinceLastUpdate >= 1) {
            // Calculate hours to deduct (convert seconds to hours)
            const hoursToDeduct = secondsToHours(secondsSinceLastUpdate);
            
            // Don't go below zero
            const newHoursLeft = Math.max(0, customer.membershipHoursLeft - hoursToDeduct);
            
            // Update customer with new hours
            const updatedCustomer = {
              ...customer,
              membershipHoursLeft: newHoursLeft
            };
            
            // Update customer locally
            updateCustomer(updatedCustomer);
            setCustomer(updatedCustomer);
            
            // Also update in Supabase every 30 seconds to avoid too many requests
            if (secondsSinceLastUpdate >= 30 || !membershipUpdated) {
              // Set flag to indicate we've started updating
              setMembershipUpdated(true);
              
              // Update in database
              supabase
                .from('customers')
                .update({
                  membership_hours_left: newHoursLeft
                })
                .eq('id', customer.id)
                .then(({ error }) => {
                  if (error) {
                    console.error("Error updating customer membership hours:", error);
                  } else {
                    console.log(`Updated customer ${customer.name} hours to ${newHoursLeft}`);
                  }
                });
            }
            
            // Update last update time
            lastUpdateTimeRef.current = now;
          }
        }
      }, 1000);
    }
    
    // Clean up interval on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [station, customers, station.currentSession, customer, updateCustomer, station.hourlyRate, membershipUpdated]);

  // Format elapsed time as hh:mm:ss
  const formatTimeDisplay = () => {
    return formatSecondsAsDuration(elapsedSeconds);
  };

  if (!station.isOccupied || !station.currentSession) {
    return null;
  }

  // Check if we should display membership hours usage
  const showMembershipHours = customer && 
    isMembershipActive(customer) && 
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
      
      {/* Show current membership hours status for members */}
      {showMembershipHours && (
        <div className="flex justify-between items-center text-xs border-t border-gray-600 pt-2">
          <span className="text-white">Hours Left:</span>
          <span className="text-amber-400 font-bold">
            {formatSecondsAsDuration(Math.floor(customer.membershipHoursLeft * 3600))}
          </span>
        </div>
      )}
    </div>
  );
};

export default StationTimer;
