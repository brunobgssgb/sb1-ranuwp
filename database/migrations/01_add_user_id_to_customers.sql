-- Add user_id column to customers table
ALTER TABLE public.customers 
ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Update RLS policies for customers
DROP POLICY IF EXISTS "Enable read access for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable update for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.customers;

CREATE POLICY "Enable read access for own customers" 
ON public.customers FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Enable insert access for own customers" 
ON public.customers FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for own customers" 
ON public.customers FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Enable delete for own customers" 
ON public.customers FOR DELETE 
USING (user_id = auth.uid());