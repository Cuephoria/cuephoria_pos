
import { supabase } from "@/integrations/supabase/client";

/**
 * Optimized queries for Supabase to improve performance
 */

/**
 * Get recent bills with pagination and minimal fields
 */
export const getRecentBills = async (limit = 10, offset = 0) => {
  try {
    const { data, error, count } = await supabase
      .from('bills')
      .select('id, customer_id, total, created_at, payment_method', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return { data, count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching recent bills:', error);
    return { data: null, count: 0, error };
  }
};

/**
 * Get active sessions efficiently
 */
export const getActiveSessions = async () => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, station_id, customer_id, start_time')
      .is('end_time', null);
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return { data: null, error };
  }
};

/**
 * Get bill details with items optimized
 */
export const getBillWithItems = async (billId: string) => {
  try {
    const [billResponse, itemsResponse] = await Promise.all([
      supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single(),
      
      supabase
        .from('bill_items')
        .select('*')
        .eq('bill_id', billId)
    ]);
    
    if (billResponse.error) throw billResponse.error;
    if (itemsResponse.error) throw itemsResponse.error;
    
    return { 
      bill: billResponse.data,
      items: itemsResponse.data,
      error: null 
    };
  } catch (error) {
    console.error(`Error fetching bill ${billId}:`, error);
    return { bill: null, items: null, error };
  }
};

/**
 * Get sales data for dashboard with time range filtering
 */
export const getSalesByTimeRange = async (
  range: 'today' | 'week' | 'month' | 'year',
  includeItems = false
) => {
  try {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    let query = supabase
      .from('bills')
      .select(
        includeItems ? 
          'id, customer_id, subtotal, total, discount, created_at, payment_method' :
          'id, subtotal, total, created_at'
      )
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString())
      .order('created_at', { ascending: false });
      
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching sales by time range:', error);
    return { data: null, error };
  }
};

/**
 * Get aggregated sales data for charting efficiently
 * Uses direct SQL aggregation for better performance
 */
export const getAggregatedSalesData = async (
  groupBy: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date = new Date()
) => {
  try {
    let timeFormat;
    switch (groupBy) {
      case 'day':
        timeFormat = "YYYY-MM-DD";
        break;
      case 'week':
        timeFormat = "YYYY-IW"; // ISO week
        break;
      case 'month':
        timeFormat = "YYYY-MM";
        break;
    }
    
    const { data, error } = await supabase
      .rpc('get_aggregated_sales', {
        p_group_by: groupBy,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_time_format: timeFormat
      });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching aggregated sales data:', error);
    return { data: null, error };
  }
};
