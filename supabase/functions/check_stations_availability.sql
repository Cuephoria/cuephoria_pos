
CREATE OR REPLACE FUNCTION public.check_stations_availability(
  p_date date,
  p_start_time time without time zone,
  p_end_time time without time zone,
  p_station_ids uuid[]
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  unavailable_count integer := 0;
BEGIN
  -- Count how many stations from the provided list are already booked
  -- for the given date and time range
  SELECT COUNT(DISTINCT b.station_id) INTO unavailable_count
  FROM bookings b
  WHERE b.booking_date = p_date
    AND b.status IN ('confirmed', 'in-progress')
    AND b.station_id = ANY(p_station_ids)
    AND (
      -- Existing booking starts during the requested time
      (b.start_time <= p_start_time AND b.end_time > p_start_time) OR
      -- Existing booking ends during the requested time
      (b.start_time < p_end_time AND b.end_time >= p_end_time) OR
      -- Existing booking is contained within the requested time
      (b.start_time >= p_start_time AND b.end_time <= p_end_time) OR
      -- Requested booking is contained within an existing booking
      (b.start_time <= p_start_time AND b.end_time >= p_end_time)
    );
  
  -- If any stations are unavailable, return false
  RETURN unavailable_count = 0;
END;
$$;
