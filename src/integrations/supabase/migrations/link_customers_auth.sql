
-- Add function to link POS customers with auth users
CREATE OR REPLACE FUNCTION link_customer_with_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there's an existing auth user with the same email
    IF NEW.email IS NOT NULL THEN
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_build_object('pos_customer_id', NEW.id)
        WHERE email = NEW.email;
        
        -- If we have an auth user with this email, update customer_profiles
        INSERT INTO public.customer_profiles (
            id, 
            name, 
            email, 
            phone, 
            is_member, 
            membership_plan, 
            membership_expiry_date, 
            membership_start_date, 
            membership_hours_left, 
            membership_duration, 
            loyalty_points, 
            total_spent, 
            total_play_time
        )
        SELECT 
            auth.users.id,
            NEW.name,
            NEW.email,
            NEW.phone,
            NEW.is_member,
            NEW.membership_plan,
            NEW.membership_expiry_date,
            NEW.membership_start_date,
            NEW.membership_hours_left,
            NEW.membership_duration,
            NEW.loyalty_points,
            NEW.total_spent,
            NEW.total_play_time
        FROM auth.users
        WHERE email = NEW.email
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            is_member = EXCLUDED.is_member,
            membership_plan = EXCLUDED.membership_plan,
            membership_expiry_date = EXCLUDED.membership_expiry_date,
            membership_start_date = EXCLUDED.membership_start_date,
            membership_hours_left = EXCLUDED.membership_hours_left,
            membership_duration = EXCLUDED.membership_duration,
            loyalty_points = EXCLUDED.loyalty_points,
            total_spent = EXCLUDED.total_spent,
            total_play_time = EXCLUDED.total_play_time,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up trigger on customers table
DROP TRIGGER IF EXISTS link_customer_auth_trigger ON public.customers;

CREATE TRIGGER link_customer_auth_trigger
AFTER INSERT OR UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION link_customer_with_auth();

-- Add email column to customers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.customers ADD COLUMN email TEXT;
    END IF;
END$$;

-- Create a view to see connected customers
CREATE OR REPLACE VIEW connected_customers AS
SELECT 
    c.id as customer_id,
    c.name,
    c.email,
    c.phone,
    c.is_member,
    u.id as auth_user_id,
    u.email as auth_email,
    u.last_sign_in_at
FROM public.customers c
LEFT JOIN auth.users u ON c.email = u.email
WHERE c.email IS NOT NULL;
