-- Fix Storage Policies for Public Access
-- Run this in your Supabase SQL Editor

-- First, drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view inspection photos" ON storage.objects;

-- Create new public policies for the inspection-photos bucket
-- Allow anyone to view photos (since bucket is public)
CREATE POLICY "Public can view inspection photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'inspection-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated can upload inspection photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'inspection-photos');

-- Allow authenticated users to update their photos
CREATE POLICY "Authenticated can update inspection photos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'inspection-photos');

-- Allow authenticated users to delete their photos
CREATE POLICY "Authenticated can delete inspection photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'inspection-photos');

-- Also ensure the bucket exists and is public
DO $$
BEGIN
  -- Check if bucket exists
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'inspection-photos') THEN
    -- Create the bucket as public
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('inspection-photos', 'inspection-photos', true);
  ELSE
    -- Update existing bucket to be public
    UPDATE storage.buckets 
    SET public = true 
    WHERE id = 'inspection-photos';
  END IF;
END
$$;

-- Verify the bucket is public
SELECT id, name, public FROM storage.buckets WHERE id = 'inspection-photos';