-- Fix payment columns in sales table
ALTER TABLE public.sales 
DROP COLUMN IF EXISTS payment_status;

ALTER TABLE public.sales 
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_id TEXT;

-- Create indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_sales_payment_lookup
ON public.sales(payment_id, payment_status)
WHERE payment_id IS NOT NULL;

-- Add webhook URL column to users
ALTER TABLE public.users
ADD COLUMN webhook_url TEXT;