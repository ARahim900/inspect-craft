# Easy Supabase Database Setup Guide 🚀

## Step 1: Open Supabase Dashboard
1. Click this link: [Your Supabase Project](https://supabase.com/dashboard/project/epirocvvdzxiypdvdlwf)
2. Sign in if needed

## Step 2: Go to SQL Editor
1. Look at the left sidebar
2. Find and click **"SQL Editor"** (it has a `</>` icon)

## Step 3: Create New Query
1. Click the **"+ New query"** button (usually green)
2. A blank editor will appear

## Step 4: Copy the Database Setup Code
Copy ALL of this code:

```sql
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
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_inspection_areas_inspection_id ON inspection_areas(inspection_id);
CREATE INDEX idx_inspection_items_area_id ON inspection_items(area_id);

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

-- Create policies
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
```

## Step 5: Paste and Run
1. **Paste** the code into the SQL editor
2. Click the **"Run"** button (usually at the bottom right, looks like a play button ▶️)
3. Wait for "Success" message

## Step 6: Verify Everything Worked
1. Click **"Table Editor"** in the left sidebar
2. You should see 3 new tables:
   - `inspections`
   - `inspection_areas`
   - `inspection_items`

3. Click **"Storage"** in the left sidebar
4. You should see a bucket called `inspection-photos`

## ✅ That's It! You're Done!

Your database is now set up and ready to use. Go back to your InspectCraft app and:
1. Create a new inspection
2. Add some inspection points
3. Upload photos
4. Save it

The data will now be stored in your Supabase database!

## 🆘 If Something Goes Wrong
- Make sure you copied ALL the SQL code
- Check for any red error messages after clicking Run
- If you see "relation already exists", that's okay - it means the tables were already created

## 📞 Still Need Help?
The SQL code is also saved in: `src/lib/supabase-schema.sql`