
-- Add reset_pin and referred_by fields to customer_profiles table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS reset_pin TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Create a new table for promotion codes
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create a new table for redeemed loyalty points
CREATE TABLE IF NOT EXISTS public.loyalty_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customer_profiles(id),
    points_redeemed INTEGER NOT NULL,
    redemption_code TEXT NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    used_at TIMESTAMPTZ
);

-- Add RLS policies for promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Allow admin to manage promotions
CREATE POLICY admin_all_promotions ON public.promotions
    USING (EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid() AND is_admin = true
    ));

-- Allow customers to view active promotions
CREATE POLICY customers_view_promotions ON public.promotions
    FOR SELECT USING (is_active = true);

-- Add RLS policies for loyalty_redemptions
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Allow customers to see their own redemptions
CREATE POLICY customers_own_redemptions ON public.loyalty_redemptions
    FOR SELECT USING (customer_id = auth.uid());

-- Allow admin to view all redemptions
CREATE POLICY admin_all_redemptions ON public.loyalty_redemptions
    USING (EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    ));

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_promotion_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up trigger to update updated_at column for promotions
CREATE TRIGGER update_promotion_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION update_promotion_updated_at_column();
