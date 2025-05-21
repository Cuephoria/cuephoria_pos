
// Edge function to update booking statuses
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browsers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Log function execution for tracking
    console.log("Running update_missed_bookings at:", new Date().toISOString());

    // Call the update_missed_bookings function
    const { data, error } = await supabaseClient.rpc('update_missed_bookings');

    if (error) {
      console.error("Error calling update_missed_bookings:", error);
      throw error;
    }

    // Update in-progress bookings as well
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const now = new Date().toLocaleTimeString('en-US', { hour12: false }); // HH:MM:SS format

    // Update bookings to in-progress if they've started but not completed
    const { data: inProgressData, error: inProgressError } = await supabaseClient
      .from('bookings')
      .update({ status: 'in-progress' })
      .eq('booking_date', today)
      .eq('status', 'confirmed')
      .lt('start_time', now)
      .gt('end_time', now);

    if (inProgressError) {
      console.error("Error updating in-progress bookings:", inProgressError);
    } else {
      console.log("Updated in-progress bookings:", inProgressData || "No bookings to update");
    }

    // Update completed bookings
    const { data: completedData, error: completedError } = await supabaseClient
      .from('bookings')
      .update({ status: 'completed' })
      .eq('booking_date', today)
      .eq('status', 'in-progress')
      .lt('end_time', now);

    if (completedError) {
      console.error("Error updating completed bookings:", completedError);
    } else {
      console.log("Updated completed bookings:", completedData || "No bookings to update");
    }

    // Log the successful update
    console.log("Booking statuses updated successfully at", new Date().toISOString());

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: "Booking statuses updated successfully", 
        timestamp: new Date().toISOString(),
        updates: {
          noShow: data,
          inProgress: inProgressData,
          completed: completedData
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating booking statuses:", error);

    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to update booking statuses",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
