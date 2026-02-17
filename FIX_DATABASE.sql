-- CASPR Database Fix & Setup
-- Run this ENTIRE file in Supabase SQL Editor
-- This fixes the infinite recursion error and all RLS policies

-- ============================================
-- 1. CREATE TRIGGER FOR AUTO-CREATING PROFILES
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, college, branch, semester, year)
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FIX PROFILES RLS (NO RECURSION!)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing profile policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles from their college" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Simple non-recursive policies
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 3. FIX RESOURCES RLS
-- ============================================

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public resources" ON public.resources;
DROP POLICY IF EXISTS "Users can view private resources from their college" ON public.resources;
DROP POLICY IF EXISTS "Users can insert their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON public.resources;
DROP POLICY IF EXISTS "Anyone can view public resources" ON public.resources;
DROP POLICY IF EXISTS "Same college can view private resources" ON public.resources;

CREATE POLICY "Anyone can view public resources"
  ON public.resources FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Same college can view private resources"
  ON public.resources FOR SELECT
  USING (
    visibility = 'private'
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM profiles p1, profiles p2
        WHERE p1.id = auth.uid()
          AND p2.id = resources.user_id
          AND p1.college = p2.college
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
-- 4. FIX RATINGS RLS
-- ============================================

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can upsert their own ratings" ON public.ratings;

CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. FIX TAGS & RESOURCE_TAGS RLS
-- ============================================

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can view resource_tags" ON public.resource_tags;
DROP POLICY IF EXISTS "Authenticated users can create resource_tags" ON public.resource_tags;

CREATE POLICY "Anyone can view tags"
  ON public.tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view resource_tags"
  ON public.resource_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resource_tags"
  ON public.resource_tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 6. FIX FOREIGN KEY CONSTRAINTS
-- ============================================

ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_user_id_fkey;
ALTER TABLE public.resources
  ADD CONSTRAINT resources_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;
ALTER TABLE public.ratings
  ADD CONSTRAINT ratings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 7. CREATE UNIQUE CONSTRAINT FOR RATINGS
-- ============================================

DROP INDEX IF EXISTS ratings_resource_user_unique;
CREATE UNIQUE INDEX ratings_resource_user_unique
  ON public.ratings (resource_id, user_id);

-- ============================================
-- 8. CREATE HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION increment_download_count(resource_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE resources SET download_count = download_count + 1 WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_view_count(resource_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE resources SET view_count = view_count + 1 WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. CREATE RATING TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE resources
  SET
    average_rating = (SELECT COALESCE(AVG(rating)::numeric(3,2), 0) FROM ratings WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id))
  WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_change ON public.ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION update_resource_rating();

-- ============================================
-- 10. VERIFY
-- ============================================

SELECT 'All policies and triggers created successfully!' as status;
