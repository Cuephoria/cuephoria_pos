
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
 * Updated to ensure all sales data is properly captured
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
    
    console.log(`Fetching sales from ${startDate.toISOString()} to ${now.toISOString()}`);
    
    let query = supabase
      .from('bills')
      .select(
        includeItems ? 
          'id, customer_id, subtotal, total, discount, created_at, payment_method' :
          'id, subtotal, total, created_at'
      )
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());
      
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    if (data) {
      const totalSales = data.reduce((sum, bill) => {
        // Safely access the total property with type checking
        const billTotal = typeof bill.total === 'number' ? bill.total : 0;
        return sum + billTotal;
      }, 0);
      console.log(`Retrieved ${data.length} bills, total sales: ${totalSales}`);
    }
    
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
    
    // Using a workaround for TypeScript RPC function name validation
    // We know this function exists in the database (from get_aggregated_sales_function.sql)
    const { data, error } = await (supabase
      .rpc as any)('get_aggregated_sales', {
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

/**
 * Get total sales amount without filtering
 * This ensures we get the true total of all sales
 */
export const getTotalSales = async () => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('total');
      
    if (error) throw error;
    
    if (!data || data.length === 0) return { totalSales: 0, error: null };
    
    // Use safe type checking and null handling before reducing
    const validBills = data.filter(bill => bill && typeof bill.total === 'number');
    const totalSales = validBills.reduce((sum, bill) => sum + (bill.total as number), 0);
    
    console.log(`Total sales from all ${validBills.length} bills: ${totalSales}`);
    
    return { totalSales, error: null };
  } catch (error) {
    console.error('Error calculating total sales:', error);
    return { totalSales: 0, error };
  }
};
