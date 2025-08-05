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
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-photos', 'inspection-photos', true);

-- Create storage policies
CREATE POLICY "Anyone can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inspection-photos');
CREATE POLICY "Anyone can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'inspection-photos');