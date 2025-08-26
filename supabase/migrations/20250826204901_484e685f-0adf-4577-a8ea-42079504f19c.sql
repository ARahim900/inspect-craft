-- Create schedules table for appointment management
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 60, -- duration in minutes
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  property_location TEXT,
  property_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW())
);

-- Create invoices table for billing management
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create invoice_services table for line items
CREATE TABLE IF NOT EXISTS invoice_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoice_services_invoice_id ON invoice_services(invoice_id);

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schedules
CREATE POLICY "Users can view own schedules" ON schedules
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all schedules" ON schedules
  FOR SELECT USING (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Users can create own schedules" ON schedules
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create schedules" ON schedules
  FOR INSERT WITH CHECK (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Users can update own schedules" ON schedules
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can update all schedules" ON schedules
  FOR UPDATE USING (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Users can delete own schedules" ON schedules
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can delete all schedules" ON schedules
  FOR DELETE USING (get_current_user_role() = 'admin'::app_role);

-- Create RLS policies for invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Users can create own invoices" ON invoices
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create invoices" ON invoices
  FOR INSERT WITH CHECK (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can update all invoices" ON invoices
  FOR UPDATE USING (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can delete all invoices" ON invoices
  FOR DELETE USING (get_current_user_role() = 'admin'::app_role);

-- Create RLS policies for invoice_services
CREATE POLICY "Users can view services of own invoices" ON invoice_services
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_services.invoice_id 
    AND (invoices.user_id = auth.uid() OR get_current_user_role() = 'admin'::app_role)
  ));

CREATE POLICY "Users can create services for own invoices" ON invoice_services
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_services.invoice_id 
    AND (invoices.user_id = auth.uid() OR get_current_user_role() = 'admin'::app_role)
  ));

CREATE POLICY "Users can update services of own invoices" ON invoice_services
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_services.invoice_id 
    AND (invoices.user_id = auth.uid() OR get_current_user_role() = 'admin'::app_role)
  ));

CREATE POLICY "Users can delete services of own invoices" ON invoice_services
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_services.invoice_id 
    AND (invoices.user_id = auth.uid() OR get_current_user_role() = 'admin'::app_role)
  ));

-- Create updated_at triggers
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();