# Inspection App Issues and Fixes

## NEW: Schedules & Billing Issues (Fixed)

### **Problem: Report Scheduled & Billing Sections Not Saving**
The Schedule Management and Billing/Invoices sections were not saving or displaying data properly.

**Root Causes:**
1. Database tables (`schedules`, `invoices`, `invoice_services`) were not created
2. Row Level Security (RLS) policies were blocking operations
3. Authentication issues preventing data access

**Solution:**
1. **Run the Fix Script**: Go to Supabase SQL Editor and run the entire contents of `fix-schedules-billing.sql`
2. **Test the Connection**: Open `test-schedules-billing.html` in your browser to verify everything works
3. **Sign In**: Make sure you're authenticated in the app before using these features

**Quick Fix Commands:**
```sql
-- Run this in Supabase SQL Editor to fix everything
-- Copy the entire contents of fix-schedules-billing.sql and run it
```

## Issues Identified

### 1. **Supabase Database Tables Not Created**
**Problem:** The application is trying to save data to Supabase, but the required database tables don't exist.

**Solution:** 
1. Go to your Supabase dashboard: https://supabase.com
2. Navigate to the SQL Editor
3. Copy and run the SQL script from `src/lib/supabase-schema.sql`
4. This will create the necessary tables:
   - `inspections`
   - `inspection_areas`
   - `inspection_items`

### 2. **Storage Bucket Not Created**
**Problem:** Image uploads fail because the `inspection-photos` storage bucket doesn't exist.

**Solution:**
1. In your Supabase dashboard, go to Storage
2. Create a new bucket named `inspection-photos`
3. Set it as PUBLIC so uploaded images can be accessed
4. Alternatively, run this SQL in the SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspection-photos', 'inspection-photos', true)
ON CONFLICT (id) DO NOTHING;
```

### 3. **Missing Storage Policies**
**Problem:** Even with the bucket created, uploads may fail due to missing policies.

**Solution:**
Run these SQL commands in your Supabase SQL Editor:
```sql
-- Allow anyone to upload photos
CREATE POLICY "Anyone can upload photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'inspection-photos');

-- Allow anyone to view photos
CREATE POLICY "Anyone can view photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'inspection-photos');

-- Allow anyone to delete photos (optional)
CREATE POLICY "Anyone can delete photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'inspection-photos');
```

### 4. **Row Level Security (RLS) Blocking Operations**
**Problem:** RLS is enabled but policies might be too restrictive.

**Solution:**
The SQL script includes permissive policies. If you still have issues, temporarily disable RLS:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items DISABLE ROW LEVEL SECURITY;
```

**Note:** Re-enable RLS with proper authentication in production!

## How to Test

### 1. **Test Supabase Connection**
Open `test-supabase.html` in your browser and:
1. Click "Test Basic Connection" - Should show "Connected"
2. Click "Check Tables" - Should show all three tables exist
3. Click "Check Storage Bucket" - Should show bucket exists
4. Click "Test Insert" - Should successfully insert and delete test data
5. Click "Test File Upload" - Should successfully upload and delete test file

### 2. **Test in Application**
1. Go to http://localhost:8080
2. Click "New Inspection"
3. Fill in the required fields:
   - Property Location (required)
   - Inspector Name (required)
   - Other fields as needed
4. Add an area and inspection items
5. Try uploading a photo
6. Click "Save Inspection"
7. Check the browser console (F12) for any error messages

## Enhanced Error Logging

The application now includes detailed error logging that will help identify issues:
- Photo upload attempts log file details
- Save operations log the full data being saved
- All Supabase errors include detailed error information
- Check the browser console for these logs

## Quick Setup Script

Run this complete SQL script in your Supabase SQL Editor to set up everything:

```sql
-- Create tables
CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT,
  property_location TEXT NOT NULL,
  property_type TEXT NOT NULL,
  inspector_name TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS inspection_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS inspection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES inspection_areas(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  point TEXT NOT NULL,
  status TEXT CHECK (status IN ('Snags', 'Pass', 'Fail')) DEFAULT 'Snags',
  comments TEXT,
  location TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inspection_areas_inspection_id ON inspection_areas(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_area_id ON inspection_items(area_id);

-- Disable RLS for testing (enable with proper policies in production)
ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items DISABLE ROW LEVEL SECURITY;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspection-photos', 'inspection-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can upload photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'inspection-photos');

CREATE POLICY "Anyone can view photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'inspection-photos');

CREATE POLICY "Anyone can delete photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'inspection-photos');
```

## Common Error Messages and Solutions

### Error: "relation \"inspections\" does not exist"
**Solution:** Tables haven't been created. Run the SQL script above.

### Error: "new row violates row-level security policy"
**Solution:** RLS policies are too restrictive. Either fix policies or temporarily disable RLS.

### Error: "Failed to upload photo"
**Solution:** Storage bucket doesn't exist or policies are missing. Create bucket and policies.

### Error: "Failed to save inspection"
**Solution:** Check console for specific error. Usually related to missing tables or RLS.

## Verification Checklist

- [ ] Supabase project is created and active
- [ ] Database tables are created (inspections, inspection_areas, inspection_items)
- [ ] Storage bucket 'inspection-photos' exists and is public
- [ ] Storage policies are created
- [ ] Test file upload works
- [ ] Test data insert works
- [ ] Application can save inspections
- [ ] Application can upload photos

## Need More Help?

1. Check the browser console (F12) for detailed error messages
2. Use the test-supabase.html file to diagnose connection issues
3. Check Supabase dashboard logs for server-side errors
4. Verify your Supabase URL and API key are correct in `src/integrations/supabase/client.ts`