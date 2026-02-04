-- Add Stripe tracking columns to products table
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Index for faster lookups during sync
CREATE INDEX IF NOT EXISTS idx_produtos_stripe_id ON public.produtos(stripe_product_id);
