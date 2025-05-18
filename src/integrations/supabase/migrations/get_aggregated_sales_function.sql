
-- Function to aggregate sales data efficiently
-- This file documents the function that already exists in the database
-- Used by src/utils/supabase-queries.ts

/*
CREATE OR REPLACE FUNCTION public.get_aggregated_sales(
  p_group_by text,
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone,
  p_time_format text
) RETURNS TABLE (
  time_period text,
  total_sales numeric,
  transaction_count bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(created_at, p_time_format) AS time_period,
    SUM(total) AS total_sales,
    COUNT(*) AS transaction_count
  FROM
    bills
  WHERE
    created_at >= p_start_date AND created_at <= p_end_date
  GROUP BY
    time_period
  ORDER BY
    time_period;
END;
$$;
*/
