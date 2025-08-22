-- Phase 1: Critical Security Fixes (Fixed)
-- Add user_id to inspections table for proper ownership tracking (nullable first)
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Check if we have any admin users to assign existing inspections to
DO $$
DECLARE
    admin_user_id UUID;
    inspection_count INTEGER;
BEGIN
    -- Get the first admin user
    SELECT user_id INTO admin_user_id 
    FROM public.profiles 
    WHERE role = 'admin'::app_role 
    LIMIT 1;
    
    -- Count existing inspections without user_id
    SELECT COUNT(*) INTO inspection_count 
    FROM public.inspections 
    WHERE user_id IS NULL;
    
    -- If we have an admin user and null inspections, assign them
    IF admin_user_id IS NOT NULL AND inspection_count > 0 THEN
        UPDATE public.inspections 
        SET user_id = admin_user_id 
        WHERE user_id IS NULL;
    ELSIF inspection_count > 0 THEN
        -- If no admin users exist, delete orphaned inspections to maintain data integrity
        DELETE FROM public.inspections WHERE user_id IS NULL;
    END IF;
END $$;

-- Now make user_id NOT NULL (should be safe now)
ALTER TABLE public.inspections ALTER COLUMN user_id SET NOT NULL;

-- Remove dangerous public access policies
DROP POLICY IF EXISTS "Anyone can read inspections" ON public.inspections;
DROP POLICY IF EXISTS "Anyone can create inspections" ON public.inspections;  
DROP POLICY IF EXISTS "Anyone can update inspections" ON public.inspections;

DROP POLICY IF EXISTS "Anyone can read areas" ON public.inspection_areas;
DROP POLICY IF EXISTS "Anyone can create areas" ON public.inspection_areas;
DROP POLICY IF EXISTS "Anyone can update areas" ON public.inspection_areas;

DROP POLICY IF EXISTS "Anyone can read items" ON public.inspection_items;
DROP POLICY IF EXISTS "Anyone can create items" ON public.inspection_items;
DROP POLICY IF EXISTS "Anyone can update items" ON public.inspection_items;

-- Create secure user-based and role-based policies for inspections
CREATE POLICY "Users can view own inspections" 
ON public.inspections FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all inspections" 
ON public.inspections FOR SELECT 
TO authenticated  
USING (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Users can create own inspections" 
ON public.inspections FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own inspections" 
ON public.inspections FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can update all inspections" 
ON public.inspections FOR UPDATE 
TO authenticated
USING (get_current_user_role() = 'admin'::app_role);

-- Create secure policies for inspection areas (inherit from inspection ownership)
CREATE POLICY "Users can view areas of own inspections" 
ON public.inspection_areas FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE id = inspection_areas.inspection_id 
    AND (user_id = auth.uid() OR get_current_user_role() = 'admin'::app_role)
  )
);

CREATE POLICY "Users can create areas for own inspections" 
ON public.inspection_areas FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE id = inspection_areas.inspection_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update areas of own inspections" 
ON public.inspection_areas FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.inspections 
    WHERE id = inspection_areas.inspection_id 
    AND (user_id = auth.uid() OR get_current_user_role() = 'admin'::app_role)
  )
);

-- Create secure policies for inspection items (inherit from area/inspection ownership)
CREATE POLICY "Users can view items of own inspections" 
ON public.inspection_items FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.inspection_areas ia
    JOIN public.inspections i ON ia.inspection_id = i.id
    WHERE ia.id = inspection_items.area_id 
    AND (i.user_id = auth.uid() OR get_current_user_role() = 'admin'::app_role)
  )
);

CREATE POLICY "Users can create items for own inspections" 
ON public.inspection_items FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.inspection_areas ia
    JOIN public.inspections i ON ia.inspection_id = i.id
    WHERE ia.id = inspection_items.area_id 
    AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items of own inspections" 
ON public.inspection_items FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.inspection_areas ia
    JOIN public.inspections i ON ia.inspection_id = i.id
    WHERE ia.id = inspection_items.area_id 
    AND (i.user_id = auth.uid() OR get_current_user_role() = 'admin'::app_role)
  )
);

-- Update storage policies to be more secure
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload inspection photos" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'inspection-photos');

CREATE POLICY "Authenticated users can view inspection photos" 
ON storage.objects FOR SELECT 
TO authenticated
USING (bucket_id = 'inspection-photos');