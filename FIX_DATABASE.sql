-- CASPR Database Fix & Setup
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE TRIGGER FOR AUTO-CREATING PROFILES
-- ============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    college,
    branch,
    semester,
    year
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'college', 'Unknown'),
    COALESCE(new.raw_user_meta_data->>'branch', 'Unknown'),
    COALESCE((new.raw_user_meta_data->>'semester')::integer, 1),
    COALESCE((new.raw_user_meta_data->>'year')::integer, 1)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FIX FOREIGN KEY CONSTRAINTS
-- ============================================

ALTER TABLE public.resources 
  DROP CONSTRAINT IF EXISTS resources_user_id_fkey;

ALTER TABLE public.resources
  ADD CONSTRAINT resources_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.ratings 
  DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;

ALTER TABLE public.ratings
  ADD CONSTRAINT ratings_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- ============================================
-- 3. PROFILES RLS POLICIES
-- ============================================

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles from their college" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles from their college" 
  ON public.profiles FOR SELECT 
  USING (
    college = (SELECT college FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- 4. RESOURCES RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view public resources" ON public.resources;
DROP POLICY IF EXISTS "Users can view private resources from their college" ON public.resources;
DROP POLICY IF EXISTS "Users can insert their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON public.resources;

CREATE POLICY "Users can view public resources" 
  ON public.resources FOR SELECT 
  USING (visibility = 'public');

CREATE POLICY "Users can view private resources from their college" 
  ON public.resources FOR SELECT 
  USING (
    visibility = 'private' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.college = (
        SELECT college FROM profiles WHERE id = resources.user_id
      )
    )
  );

CREATE POLICY "Users can insert their own resources" 
  ON public.resources FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources" 
  ON public.resources FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources" 
  ON public.resources FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 5. CLEANUP ORPHANED RECORDS
-- ============================================

DELETE FROM public.resources 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ============================================
-- 6. VERIFY SUPABASE AUTH SETTINGS
-- ============================================
-- Go to: Authentication > Providers > Email
-- Make sure "Confirm email" is CHECKED
-- Site URL should be: https://caspr.voltcrash.com
-- Add redirect URLs:
--   - http://localhost:3000/auth/callback
--   - https://caspr.voltcrash.com/auth/callback

-- ============================================
-- 7. TEST THE SETUP
-- ============================================

-- Check if trigger exists
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT proname 
FROM pg_proc 
WHERE proname = 'handle_new_user';

SELECT 'Database setup complete! ✅' as status;
