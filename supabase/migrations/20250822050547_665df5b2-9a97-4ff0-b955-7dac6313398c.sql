-- Create inspections table
CREATE TABLE IF NOT EXISTS public.inspections (
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
CREATE TABLE IF NOT EXISTS public.inspection_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create inspection_items table
CREATE TABLE IF NOT EXISTS public.inspection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.inspection_areas(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  point TEXT NOT NULL,
  status TEXT CHECK (status IN ('Snags', 'Pass', 'Fail')) DEFAULT 'Snags',
  comments TEXT,
  location TEXT,
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inspection_areas_inspection_id ON public.inspection_areas(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_area_id ON public.inspection_items(area_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Create policies for inspections (admin can do everything, staff can read only)
CREATE POLICY "Authenticated users can read inspections" ON public.inspections
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can create inspections" ON public.inspections
FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update inspections" ON public.inspections
FOR UPDATE TO authenticated
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete inspections" ON public.inspections
FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Create policies for inspection areas
CREATE POLICY "Authenticated users can read areas" ON public.inspection_areas
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can create areas" ON public.inspection_areas
FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update areas" ON public.inspection_areas
FOR UPDATE TO authenticated
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete areas" ON public.inspection_areas
FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Create policies for inspection items
CREATE POLICY "Authenticated users can read items" ON public.inspection_items
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can create items" ON public.inspection_items
FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update items" ON public.inspection_items
FOR UPDATE TO authenticated
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete items" ON public.inspection_items
FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can create own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Create storage bucket for photos (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'inspection-photos') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-photos', 'inspection-photos', true);
  END IF;
END
$$;

-- Create storage policies
CREATE POLICY "Authenticated users can view photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'inspection-photos');

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'inspection-photos');

CREATE POLICY "Authenticated users can update photos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'inspection-photos');

CREATE POLICY "Authenticated users can delete photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'inspection-photos');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'wasla.solution@gmail.com' THEN 'admin'::app_role
      ELSE 'staff'::app_role
    END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_inspections_updated_at
BEFORE UPDATE ON public.inspections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();