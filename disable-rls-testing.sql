-- TEMPORARY: Disable RLS for testing only
-- WARNING: Only use this in development!

ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_services DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
DO $$
BEGIN
  RAISE NOTICE '⚠️ RLS DISABLED for testing!';
  RAISE NOTICE '🔓 Tables are now accessible without authentication';
  RAISE NOTICE '⛔ DO NOT use this in production!';
  RAISE NOTICE '';
  RAISE NOTICE 'To re-enable RLS later, run:';
  RAISE NOTICE 'ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE 'ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE 'ALTER TABLE invoice_services ENABLE ROW LEVEL SECURITY;';
END $$;