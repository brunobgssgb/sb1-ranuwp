-- Add WhatsApp configuration columns to users table
ALTER TABLE public.users 
ADD COLUMN whatsapp_secret TEXT,
ADD COLUMN whatsapp_account TEXT;

-- Create index for faster lookups
CREATE INDEX idx_users_whatsapp_config 
ON public.users(whatsapp_secret, whatsapp_account) 
WHERE whatsapp_secret IS NOT NULL AND whatsapp_account IS NOT NULL;