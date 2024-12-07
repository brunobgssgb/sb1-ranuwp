-- Add user_id column to apps table
ALTER TABLE public.apps 
ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Update RLS policies for apps
DROP POLICY IF EXISTS "Enable read access for all users" ON public.apps;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.apps;
DROP POLICY IF EXISTS "Enable update for all users" ON public.apps;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.apps;

CREATE POLICY "Enable read access for own apps" 
ON public.apps FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Enable insert access for own apps" 
ON public.apps FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for own apps" 
ON public.apps FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Enable delete for own apps" 
ON public.apps FOR DELETE 
USING (user_id = auth.uid());