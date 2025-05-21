
CREATE OR REPLACE FUNCTION public.check_stations_availability(
  p_date date,
  p_start_time time without time zone,
  p_end_time time without time zone,
  p_station_ids uuid[]
)
RETURNS TABLE (
  station_id uuid,
  is_available boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add proper logging
  RAISE NOTICE 'Checking availability for date: %, start: %, end: %, stations: %', 
    p_date, p_start_time, p_end_time, p_station_ids;

  -- Return a result set with station_id and availability status
  RETURN QUERY
  WITH booking_conflicts AS (
    SELECT 
      b.station_id
    FROM 
      bookings b
    WHERE 
      b.booking_date = p_date
      AND b.status IN ('confirmed', 'in-progress')
      AND b.station_id = ANY(p_station_ids)
      AND (
        -- Existing booking overlaps with requested time (all four cases):
        -- Case 1: Existing booking starts during the requested time
        (b.start_time <= p_start_time AND b.end_time > p_start_time) OR
        -- Case 2: Existing booking ends during the requested time
        (b.start_time < p_end_time AND b.end_time >= p_end_time) OR
        -- Case 3: Existing booking is contained within the requested time
        (b.start_time >= p_start_time AND b.end_time <= p_end_time) OR
        -- Case 4: Requested booking is contained within an existing booking
        (b.start_time <= p_start_time AND b.end_time >= p_end_time)
      )
  )
  SELECT 
    s.id AS station_id,
    NOT EXISTS (
      SELECT 1 FROM booking_conflicts bc WHERE bc.station_id = s.id
    ) AS is_available
  FROM
    unnest(p_station_ids) AS s(id);
END;
$$;
