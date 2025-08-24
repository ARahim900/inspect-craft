-- Fix email harvesting vulnerability by ensuring proper authentication requirements

-- Drop existing policies to recreate them with explicit authentication requirements
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Recreate policies with explicit authentication requirements and anonymous user exclusion
CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin'::app_role AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (get_current_user_role() = 'admin'::app_role AND auth.uid() IS NOT NULL);

-- Ensure no anonymous access is possible by explicitly denying it
CREATE POLICY "Deny all anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);