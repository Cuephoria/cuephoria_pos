
CREATE OR REPLACE FUNCTION public.check_columns_exist(table_name text, column_names text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    column_count integer;
BEGIN
    SELECT COUNT(*)
    INTO column_count
    FROM information_schema.columns
    WHERE table_name = $1
    AND column_name = ANY($2)
    AND table_schema = 'public';
    
    RETURN column_count = array_length($2, 1);
END;
$$;
