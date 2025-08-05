import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://epirocvvdzxiypdvdlwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwaXJvY3Z2ZHp4aXlwZHZkbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjI1MzgsImV4cCI6MjA2OTkzODUzOH0.Y0VlkV8XqO55En1zTLZ7iinorMHt72O37oFDbhywdTE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database tables...\n');

  // Note: The anon key cannot create tables directly. 
  // You need to run these SQL commands in the Supabase Dashboard SQL Editor
  
  const sqlCommands = `
-- Create inspections table
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

-- Create inspection_areas table
CREATE TABLE IF NOT EXISTS inspection_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create inspection_items table
CREATE TABLE IF NOT EXISTS inspection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES inspection_areas(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  point TEXT NOT NULL,
  status TEXT CHECK (status IN ('N/A', 'Pass', 'Fail')) DEFAULT 'N/A',
  comments TEXT,
  location TEXT,
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_inspection_areas_inspection_id ON inspection_areas(inspection_id);
CREATE INDEX idx_inspection_items_area_id ON inspection_items(area_id);

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Anyone can read inspections" ON inspections FOR SELECT USING (true);
CREATE POLICY "Anyone can create inspections" ON inspections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update inspections" ON inspections FOR UPDATE USING (true);

CREATE POLICY "Anyone can read areas" ON inspection_areas FOR SELECT USING (true);
CREATE POLICY "Anyone can create areas" ON inspection_areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update areas" ON inspection_areas FOR UPDATE USING (true);

CREATE POLICY "Anyone can read items" ON inspection_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create items" ON inspection_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update items" ON inspection_items FOR UPDATE USING (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspection-photos', 'inspection-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can upload photos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'inspection-photos');

CREATE POLICY "Anyone can view photos" ON storage.objects 
FOR SELECT USING (bucket_id = 'inspection-photos');
  `;

  console.log('Please follow these steps:\n');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/epirocvvdzxiypdvdlwf');
  console.log('2. Click on "SQL Editor" in the left sidebar');
  console.log('3. Copy all the SQL commands from the file: src/lib/supabase-schema.sql');
  console.log('4. Paste them in the SQL editor');
  console.log('5. Click the "Run" button\n');
  
  console.log('The SQL commands have been saved to: src/lib/supabase-schema.sql');
  console.log('\nAfter running the SQL, your database will be ready to use!');
}

setupDatabase();