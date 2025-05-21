
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  p_customer_id: string;
  p_booking_date: string;
  p_start_time: string;
  p_end_time: string;
  p_duration: number;
  p_booking_group_id: string;
  p_coupon_code: string | null;
  p_discount_percentage: number;
  p_station_ids: string[];
  p_station_prices: number[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with admin privileges
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get the request body
    const { 
      p_customer_id,
      p_booking_date,
      p_start_time,
      p_end_time,
      p_duration,
      p_booking_group_id,
      p_coupon_code,
      p_discount_percentage,
      p_station_ids,
      p_station_prices 
    } = await req.json() as RequestBody;

    // Validate required params
    if (!p_customer_id || !p_booking_date || !p_start_time || !p_end_time || !p_duration || !p_booking_group_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Validate that station IDs and prices arrays are present and same length
    if (!Array.isArray(p_station_ids) || !Array.isArray(p_station_prices) || 
        p_station_ids.length === 0 || p_station_ids.length !== p_station_prices.length) {
      return new Response(
        JSON.stringify({ error: "Invalid station parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log("Creating booking group with ID:", p_booking_group_id);
    console.log("For customer:", p_customer_id);
    console.log("With stations:", p_station_ids);
    
    // Check if any station is already booked for this time
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('station_id')
      .eq('booking_date', p_booking_date)
      .eq('start_time', p_start_time)
      .eq('status', 'confirmed')
      .in('station_id', p_station_ids);
      
    if (checkError) {
      return new Response(
        JSON.stringify({ error: "Failed to check station availability: " + checkError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    if (existingBookings && existingBookings.length > 0) {
      const alreadyBookedStations = existingBookings.map(b => b.station_id);
      return new Response(
        JSON.stringify({ error: "Some stations are already booked for this time slot", alreadyBookedStations }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }
    
    // Prepare booking records
    const bookingRecords = p_station_ids.map((stationId, index) => {
      const originalPrice = p_station_prices[index];
      const finalPrice = p_discount_percentage > 0 
        ? originalPrice * (1 - (p_discount_percentage / 100)) 
        : originalPrice;
      
      return {
        customer_id: p_customer_id,
        station_id: stationId,
        booking_date: p_booking_date,
        start_time: p_start_time,
        end_time: p_end_time,
        duration: p_duration,
        status: 'confirmed',
        booking_group_id: p_booking_group_id,
        coupon_code: p_coupon_code,
        discount_percentage: p_discount_percentage,
        original_price: originalPrice,
        final_price: finalPrice
      };
    });
    
    // Create bookings
    const { data: bookings, error: insertError } = await supabase
      .from('bookings')
      .insert(bookingRecords)
      .select();
    
    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to create bookings: " + insertError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Return the created bookings
    return new Response(
      JSON.stringify(bookings),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
