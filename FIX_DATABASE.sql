-- =============================================
-- CASPR - Complete Database Reset & Setup
-- Run this ENTIRE file in Supabase SQL Editor
-- =============================================

-- ============================================
-- STEP 1: CLEAN ALL DATA
-- ============================================

TRUNCATE public.resource_tags CASCADE;
TRUNCATE public.ratings CASCADE;
TRUNCATE public.resources CASCADE;
TRUNCATE public.tags CASCADE;

-- ============================================
-- STEP 2: BACKFILL PROFILES FOR EXISTING USERS
-- ============================================

INSERT INTO public.profiles (id, email, name, college, branch, semester, year)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'college', 'Unknown'),
  COALESCE(u.raw_user_meta_data->>'branch', 'Unknown'),
  COALESCE((u.raw_user_meta_data->>'semester')::integer, 1),
  COALESCE((u.raw_user_meta_data->>'year')::integer, 1)
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: AUTO-CREATE PROFILE TRIGGER
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
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
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
-- STEP 4: PROFILES RLS (simple, no recursion)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view profiles from their college" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
END $$;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 5: RESOURCES RLS
-- ============================================

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view public resources" ON public.resources;
  DROP POLICY IF EXISTS "Users can view public resources" ON public.resources;
  DROP POLICY IF EXISTS "Same college can view private resources" ON public.resources;
  DROP POLICY IF EXISTS "Users can view private resources from their college" ON public.resources;
  DROP POLICY IF EXISTS "Owner can view own private resources" ON public.resources;
  DROP POLICY IF EXISTS "Users can insert their own resources" ON public.resources;
  DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
  DROP POLICY IF EXISTS "Users can delete their own resources" ON public.resources;
END $$;

CREATE POLICY "Anyone can view public resources"
  ON public.resources FOR SELECT USING (visibility = 'public');

CREATE POLICY "Owner can view own private resources"
  ON public.resources FOR SELECT
  USING (visibility = 'private' AND user_id = auth.uid());

CREATE POLICY "Same college can view private resources"
  ON public.resources FOR SELECT
  USING (
    visibility = 'private'
    AND EXISTS (
      SELECT 1 FROM profiles p1, profiles p2
      WHERE p1.id = auth.uid()
        AND p2.id = resources.user_id
        AND p1.college = p2.college
    )
  );

CREATE POLICY "Users can insert their own resources"
  ON public.resources FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON public.resources FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON public.resources FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: RATINGS RLS
-- ============================================

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view ratings" ON public.ratings;
  DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.ratings;
  DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
  DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.ratings;
END $$;

CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 7: TAGS & RESOURCE_TAGS RLS
-- ============================================

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
  DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.tags;
  DROP POLICY IF EXISTS "Anyone can view resource_tags" ON public.resource_tags;
  DROP POLICY IF EXISTS "Authenticated users can create resource_tags" ON public.resource_tags;
END $$;

CREATE POLICY "Anyone can view tags"
  ON public.tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view resource_tags"
  ON public.resource_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resource_tags"
  ON public.resource_tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- STEP 8: UNIQUE CONSTRAINT FOR RATINGS
-- ============================================

DROP INDEX IF EXISTS ratings_resource_user_unique;
CREATE UNIQUE INDEX ratings_resource_user_unique
  ON public.ratings (resource_id, user_id);

-- ============================================
-- STEP 9: HELPER FUNCTIONS
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
-- STEP 10: AUTO-UPDATE RATING AVERAGES
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
-- STEP 11: ADD CASCADE DELETE FOR RESOURCE_TAGS
-- ============================================

ALTER TABLE public.resource_tags DROP CONSTRAINT IF EXISTS resource_tags_resource_id_fkey;
ALTER TABLE public.resource_tags
  ADD CONSTRAINT resource_tags_resource_id_fkey
  FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;

ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_resource_id_fkey;
ALTER TABLE public.ratings
  ADD CONSTRAINT ratings_resource_id_fkey
  FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;

-- ============================================
-- STEP 12: VERIFY EVERYTHING
-- ============================================

SELECT 'Profiles:' as info, count(*) as count FROM public.profiles;
SELECT 'Auth users:' as info, count(*) as count FROM auth.users;
SELECT 'Setup complete!' as status;
