
-- Create customer_profiles table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    is_member BOOLEAN DEFAULT false,
    membership_plan TEXT,
    membership_expiry_date TIMESTAMPTZ,
    membership_start_date TIMESTAMPTZ,
    membership_hours_left INTEGER,
    membership_duration TEXT,
    loyalty_points INTEGER DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    total_play_time INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create RLS policies for customer_profiles
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read/update their own profile
CREATE POLICY customer_profiles_select ON public.customer_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY customer_profiles_update ON public.customer_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow any authenticated staff or admin to read/update any profile
CREATE POLICY staff_admin_select ON public.customer_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE id = auth.uid()
        )
    );

CREATE POLICY staff_admin_update ON public.customer_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE id = auth.uid()
        )
    );

-- Add insert policy for new registrations
CREATE POLICY customer_profiles_insert ON public.customer_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable email authentication in auth schema
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create function to update customer_profiles.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up trigger to update updated_at column
CREATE TRIGGER update_customer_profiles_updated_at
BEFORE UPDATE ON public.customer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
