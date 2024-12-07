-- Add Mercado Pago configuration columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS mercadopago_token TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_webhook TEXT;

-- Add payment information to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_sales_payment 
ON public.sales(payment_id) 
WHERE payment_id IS NOT NULL;

-- Create index for payment status lookups
CREATE INDEX IF NOT EXISTS idx_sales_payment_status
ON public.sales(payment_status);