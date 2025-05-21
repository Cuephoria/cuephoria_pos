
/**
 * Station availability checking utilities
 */

/**
 * Check if stations are available for a specific time slot
 * @param stationIds Array of station IDs to check
 * @param date Booking date in YYYY-MM-DD format
 * @param startTime Start time in HH:MM format
 * @param endTime End time in HH:MM format
 * @returns Promise resolving to object with availability info and unavailable station IDs
 */
export const checkStationAvailability = async (
  stationIds: string[],
  date: string,
  startTime: string,
  endTime: string
): Promise<{ available: boolean, unavailableStationIds: string[], unavailableStations?: Array<{id: string, name: string}> }> => {
  try {
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Add seconds to times for proper comparison
    const startTimeWithSeconds = `${startTime}:00`;
    const endTimeWithSeconds = `${endTime}:00`;
    
    // Try to use the RPC function first
    try {
      const { data: availability, error } = await supabase.rpc(
        'check_stations_availability',
        {
          p_date: date,
          p_start_time: startTimeWithSeconds,
          p_end_time: endTimeWithSeconds,
          p_station_ids: stationIds
        }
      ) as { 
        data: Array<{ station_id: string; is_available: boolean }> | null; 
        error: any 
      };
      
      if (!error && Array.isArray(availability)) {
        console.log("Station availability from RPC:", availability);
        
        // Get unavailable station IDs
        const unavailableStationIds = availability
          .filter(station => !station.is_available)
          .map(station => station.station_id);
        
        // If any unavailable stations, get their details
        let unavailableStations = [];
        if (unavailableStationIds.length > 0) {
          const { data: stationDetails } = await supabase
            .from('stations')
            .select('id, name')
            .in('id', unavailableStationIds);
            
          unavailableStations = stationDetails || unavailableStationIds.map(id => ({
            id,
            name: 'Unknown station'
          }));
        }
        
        return {
          available: unavailableStationIds.length === 0,
          unavailableStationIds,
          unavailableStations
        };
      } else {
        console.log("Falling back to manual availability check due to RPC error:", error);
        // Fall back to manual check if RPC fails
        throw new Error("RPC failed");
      }
    } catch (rpcError) {
      console.log("RPC error, using fallback check:", rpcError);
      
      // Manual fallback check (query the bookings directly)
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('station_id, station:stations(id, name)')
        .eq('booking_date', date)
        .in('status', ['confirmed', 'in-progress'])
        .or(`start_time.lte.${startTimeWithSeconds},end_time.gt.${startTimeWithSeconds}`)
        .or(`start_time.lt.${endTimeWithSeconds},end_time.gte.${endTimeWithSeconds}`)
        .or(`start_time.gte.${startTimeWithSeconds},end_time.lte.${endTimeWithSeconds}`)
        .or(`start_time.lte.${startTimeWithSeconds},end_time.gte.${endTimeWithSeconds}`);
      
      if (error) {
        console.error("Error in fallback availability check:", error);
        return { available: false, unavailableStationIds: [] };
      }
      
      console.log("Manual check found these existing bookings:", existingBookings);
      
      // Extract the unavailable station IDs
      const unavailableStationIds = existingBookings
        ? existingBookings
            .filter(booking => stationIds.includes(booking.station_id))
            .map(booking => booking.station_id)
        : [];
      
      // Get station details
      const unavailableStations = existingBookings
        ? existingBookings
            .filter(booking => stationIds.includes(booking.station_id))
            .map(booking => ({
              id: booking.station_id,
              name: booking.station?.name || 'Unknown station'
            }))
        : [];
      
      return {
        available: unavailableStationIds.length === 0,
        unavailableStationIds,
        unavailableStations
      };
    }
  } catch (error) {
    console.error("Error in checkStationAvailability:", error);
    return { available: false, unavailableStationIds: [] };
  }
};

/**
 * Perform a final availability check right before booking
 * This is a safeguard against race conditions between selecting stations and confirming booking
 */
export const performFinalAvailabilityCheck = async (
  stationIds: string[],
  date: string,
  startTime: string,
  endTime: string
): Promise<{success: boolean, message?: string, unavailableStations?: Array<{id: string, name: string}>}> => {
  try {
    const result = await checkStationAvailability(stationIds, date, startTime, endTime);
    
    if (!result.available) {
      const stationNames = result.unavailableStations?.map(s => s.name).join(', ') || 'Some stations';
      return {
        success: false,
        message: `${stationNames} ${result.unavailableStations?.length === 1 ? 'is' : 'are'} no longer available for the selected time. Please select a different time or station.`,
        unavailableStations: result.unavailableStations
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in performFinalAvailabilityCheck:', error);
    return { 
      success: false, 
      message: 'Could not verify station availability. Please try again.' 
    };
  }
};
