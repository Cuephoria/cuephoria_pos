
-- Function to aggregate sales data efficiently
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

-- Create index to optimize bill queries by date
CREATE INDEX IF NOT EXISTS bills_created_at_idx ON bills (created_at);

-- Create index to optimize session queries
CREATE INDEX IF NOT EXISTS sessions_end_time_idx ON sessions (end_time);
CREATE INDEX IF NOT EXISTS sessions_station_id_idx ON sessions (station_id);
CREATE INDEX IF NOT EXISTS sessions_customer_id_idx ON sessions (customer_id);
