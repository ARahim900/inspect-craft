-- Remove the overly permissive policy that allows any authenticated user to read all inspections
DROP POLICY IF EXISTS "Authenticated users can read inspections" ON public.inspections;

-- Verify the remaining policies are secure:
-- 1. "Users can view own inspections" - allows users to see only their own data (user_id = auth.uid())
-- 2. "Admins can view all inspections" - allows admins to see all data (get_current_user_role() = 'admin'::app_role)

-- Also remove similar overly permissive policies from related tables for consistency
DROP POLICY IF EXISTS "Authenticated users can read areas" ON public.inspection_areas;
DROP POLICY IF EXISTS "Authenticated users can read items" ON public.inspection_items;