-- SAFE FIX FOR SCHEDULES AND BILLING TABLES
-- This script works with existing functions and policies

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

-- Create indexes (using IF NOT EXISTS to avoid errors)
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

-- Create triggers (drop first to avoid conflicts)
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

-- Enable RLS on new tables
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_services ENABLE ROW LEVEL SECURITY;

-- Drop only the NEW policies we're trying to create (leave existing ones intact)
DROP POLICY IF EXISTS "Authenticated users can view all schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can create schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can update schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can delete schedules" ON schedules;

DROP POLICY IF EXISTS "Authenticated users can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON invoices;

DROP POLICY IF EXISTS "Authenticated users can view all invoice services" ON invoice_services;
DROP POLICY IF EXISTS "Authenticated users can create invoice services" ON invoice_services;
DROP POLICY IF EXISTS "Authenticated users can update invoice services" ON invoice_services;
DROP POLICY IF EXISTS "Authenticated users can delete invoice services" ON invoice_services;

-- Check if Admin policies already exist, if not create simple authenticated user policies
DO $$
BEGIN
  -- Check for schedules policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'schedules' 
    AND policyname LIKE '%Admin%'
  ) THEN
    -- Create simple policies for schedules
    CREATE POLICY "Authenticated users can view all schedules" ON schedules
      FOR SELECT USING (auth.uid() IS NOT NULL);
    
    CREATE POLICY "Authenticated users can create schedules" ON schedules
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    
    CREATE POLICY "Authenticated users can update schedules" ON schedules
      FOR UPDATE USING (auth.uid() IS NOT NULL);
    
    CREATE POLICY "Authenticated users can delete schedules" ON schedules
      FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;

  -- Check for invoices policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'invoices' 
    AND policyname LIKE '%Admin%'
  ) THEN
    -- Create simple policies for invoices
    CREATE POLICY "Authenticated users can view all invoices" ON invoices
      FOR SELECT USING (auth.uid() IS NOT NULL);
    
    CREATE POLICY "Authenticated users can create invoices" ON invoices
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    
    CREATE POLICY "Authenticated users can update invoices" ON invoices
      FOR UPDATE USING (auth.uid() IS NOT NULL);
    
    CREATE POLICY "Authenticated users can delete invoices" ON invoices
      FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;

  -- Always create policies for invoice_services (new table)
  CREATE POLICY "Authenticated users can view all invoice services" ON invoice_services
    FOR SELECT USING (auth.uid() IS NOT NULL);
  
  CREATE POLICY "Authenticated users can create invoice services" ON invoice_services
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  
  CREATE POLICY "Authenticated users can update invoice services" ON invoice_services
    FOR UPDATE USING (auth.uid() IS NOT NULL);
  
  CREATE POLICY "Authenticated users can delete invoice services" ON invoice_services
    FOR DELETE USING (auth.uid() IS NOT NULL);
END $$;

-- Grant permissions
GRANT ALL ON schedules TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON invoice_services TO authenticated;
GRANT SELECT ON schedules TO anon;
GRANT SELECT ON invoices TO anon;
GRANT SELECT ON invoice_services TO anon;

-- Final verification
DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
  existing_func_type TEXT;
BEGIN
  -- Check function return type
  SELECT pg_get_function_result(oid) INTO existing_func_type
  FROM pg_proc
  WHERE proname = 'get_current_user_role';
  
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
  
  RAISE NOTICE '✅ Setup complete!';
  RAISE NOTICE '📋 Tables ready: % tables found', table_count;
  RAISE NOTICE '🔒 RLS policies: % policies active', policy_count;
  RAISE NOTICE '🔧 Function get_current_user_role exists with type: %', existing_func_type;
  RAISE NOTICE '';
  RAISE NOTICE '💡 If you still have issues:';
  RAISE NOTICE '   1. Try signing in with the test page';
  RAISE NOTICE '   2. Check if your user has the right permissions';
  RAISE NOTICE '   3. Temporarily disable RLS for testing (not for production)';
END $$;