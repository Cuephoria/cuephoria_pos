
-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.customers(id),
    referee_id UUID NOT NULL REFERENCES public.customers(id),
    code VARCHAR(12) NOT NULL,
    points_awarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_referral_pair UNIQUE (referrer_id, referee_id)
);

-- Add referral_code column to customer profiles
ALTER TABLE IF EXISTS public.customers
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12);

-- Add referred_by_code column to store which referral code was used
ALTER TABLE IF EXISTS public.customers
ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(12);

-- Add redeemed_rewards column to store JSON of redemption history
ALTER TABLE IF EXISTS public.customers
ADD COLUMN IF NOT EXISTS redeemed_rewards JSONB DEFAULT '[]'::jsonb;

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_percentage INTEGER,
    discount_amount INTEGER,
    code VARCHAR(20),
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.referrals IS 'Stores customer referral relationships';
COMMENT ON TABLE public.promotions IS 'Stores promotion information for the customer portal';
COMMENT ON TABLE public.rewards IS 'Stores available rewards for loyalty points redemption';
