-- Add WhatsApp configuration columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS whatsapp_secret TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_account TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_config 
ON public.users(whatsapp_secret, whatsapp_account);

-- Create partial index for non-null values
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_config_notnull
ON public.users(whatsapp_secret, whatsapp_account)
WHERE whatsapp_secret IS NOT NULL AND whatsapp_account IS NOT NULL;