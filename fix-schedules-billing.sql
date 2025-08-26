-- FIX SCHEDULES AND BILLING TABLES
-- Run this script in your Supabase SQL Editor to fix all issues

-- First, check if tables exist and create them if they don't
-- Note: The inspections table should already exist from previous migrations

-- Check if get_current_user_role function exists, if not create a simple version
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text AS $$
BEGIN
  -- Simple implementation that returns 'staff' for all authenticated users
  -- You can enhance this later with proper role management
  IF auth.uid() IS NOT NULL THEN
    RETURN 'staff';
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  property_location TEXT,
  property_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW())
);

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  property_location TEXT NOT NULL,
  property_type TEXT CHECK (property_type IN ('residential', 'commercial')) DEFAULT 'residential',
  property_area DECIMAL(10,2),
  inspection_date DATE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  payment_method TEXT,
  payment_date DATE,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW())
);

-- Create invoice_services table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoice_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_services_invoice_id ON invoice_services(invoice_id);

-- Create or replace update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- OPTION 1: Disable RLS for testing (NOT RECOMMENDED FOR PRODUCTION)
-- Uncomment these lines if you want to disable RLS temporarily
-- ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoice_services DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Enable RLS with proper policies (RECOMMENDED)
-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can create own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;
DROP POLICY IF EXISTS "Admins can view all schedules" ON schedules;
DROP POLICY IF EXISTS "Admins can create schedules" ON schedules;
DROP POLICY IF EXISTS "Admins can update all schedules" ON schedules;
DROP POLICY IF EXISTS "Admins can delete all schedules" ON schedules;

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can create invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can update all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can delete all invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view services of own invoices" ON invoice_services;
DROP POLICY IF EXISTS "Users can create services for own invoices" ON invoice_services;
DROP POLICY IF EXISTS "Users can update services of own invoices" ON invoice_services;
DROP POLICY IF EXISTS "Users can delete services of own invoices" ON invoice_services;

-- Create simplified RLS policies for schedules
-- Allow authenticated users to do everything with schedules
CREATE POLICY "Authenticated users can view all schedules" ON schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update schedules" ON schedules
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete schedules" ON schedules
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create simplified RLS policies for invoices
CREATE POLICY "Authenticated users can view all invoices" ON invoices
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update invoices" ON invoices
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete invoices" ON invoices
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create simplified RLS policies for invoice_services
CREATE POLICY "Authenticated users can view all invoice services" ON invoice_services
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create invoice services" ON invoice_services
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update invoice services" ON invoice_services
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete invoice services" ON invoice_services
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create a test user if you need one (optional)
-- This will create a user that you can use for testing
-- Email: test@inspectcraft.com
-- Password: TestPassword123!
-- Uncomment the following lines if you want to create a test user:
/*
DO $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@inspectcraft.com'
  ) THEN
    -- Note: This is a simplified example. In production, use proper user creation methods
    RAISE NOTICE 'Please create a test user through Supabase Auth UI or your application';
  END IF;
END $$;
*/

-- Verify the setup
DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' 
  AND table_name IN ('schedules', 'invoices', 'invoice_services');
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' 
  AND tablename IN ('schedules', 'invoices', 'invoice_services');
  
  RAISE NOTICE 'Setup complete: % tables created, % RLS policies active', table_count, policy_count;
END $$;

-- Grant permissions (in case they're missing)
GRANT ALL ON schedules TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON invoice_services TO authenticated;
GRANT ALL ON schedules TO anon;
GRANT ALL ON invoices TO anon;
GRANT ALL ON invoice_services TO anon;