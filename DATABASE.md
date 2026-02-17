# CASPR Database Setup

Complete SQL commands for setting up the CASPR database in Supabase.

---

## 1. User Profiles

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  college text NOT NULL,
  branch text NOT NULL,
  semester integer NOT NULL CHECK (semester >= 1 AND semester <= 12),
  year integer NOT NULL CHECK (year >= 1 AND year <= 6),
  profile_picture text,
  bio text
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup (with metadata from signup)
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

---

## 2. Resources & Tags

```sql
-- Resources table
CREATE TABLE public.resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  semester integer NOT NULL CHECK (semester >= 1 AND semester <= 8),
  year_batch text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('notes', 'question_papers', 'solutions', 'project_reports', 'study_material')),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  file_type text NOT NULL,
  download_count integer DEFAULT 0 NOT NULL,
  view_count integer DEFAULT 0 NOT NULL,
  average_rating decimal(3,2) DEFAULT 0.00,
  rating_count integer DEFAULT 0
);

-- Tags table
CREATE TABLE public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Resource-Tags junction
CREATE TABLE public.resource_tags (
  resource_id uuid REFERENCES public.resources ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.tags ON DELETE CASCADE NOT NULL,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (resource_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;

-- Resources RLS (with college-based access control for private resources)
CREATE POLICY "Resources are viewable with college check"
  ON resources FOR SELECT
  USING (
    visibility = 'public'
    OR (
      visibility = 'private'
      AND auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM profiles AS uploader
        WHERE uploader.id = resources.user_id
        AND uploader.college = (SELECT college FROM profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Authenticated users can insert resources" ON resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON resources FOR DELETE USING (auth.uid() = user_id);

-- Tags RLS
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Resource-Tags RLS
CREATE POLICY "Resource tags are viewable by everyone" ON resource_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can link tags" ON resource_tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete tag links" ON resource_tags FOR DELETE USING (auth.uid() IS NOT NULL);

-- Updated_at trigger
CREATE TRIGGER on_resource_updated
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Indexes
CREATE INDEX resources_user_id_idx ON public.resources(user_id);
CREATE INDEX resources_created_at_idx ON public.resources(created_at DESC);
CREATE INDEX resources_semester_idx ON public.resources(semester);
CREATE INDEX resources_resource_type_idx ON public.resources(resource_type);
CREATE INDEX resources_download_count_idx ON public.resources(download_count DESC);
CREATE INDEX resources_view_count_idx ON public.resources(view_count DESC);
CREATE INDEX resources_visibility_idx ON public.resources(visibility);
CREATE INDEX resources_visibility_college_idx ON public.resources(visibility, user_id);
CREATE INDEX tags_name_idx ON public.tags(name);
CREATE INDEX resource_tags_resource_id_idx ON public.resource_tags(resource_id);
CREATE INDEX resource_tags_tag_id_idx ON public.resource_tags(tag_id);
```

---

## 3. Storage Bucket

```sql
-- Create storage bucket (run in Supabase dashboard or via API)
-- Bucket name: resource-files
-- Public: true

-- Storage policies
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id = 'resource-files');

CREATE POLICY "Anyone can view files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resource-files');

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id = 'resource-files');

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id = 'resource-files');
```

---

## 4. Ratings & Reviews

```sql
-- Ratings table
CREATE TABLE public.ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  resource_id uuid REFERENCES public.resources ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  UNIQUE(resource_id, user_id)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Ratings are viewable by everyone" ON ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON ratings FOR DELETE USING (auth.uid() = user_id);

-- Auto-update average rating function
CREATE OR REPLACE FUNCTION update_resource_rating(p_resource_id uuid)
RETURNS void AS $$
DECLARE
  avg_rating decimal(3,2);
  count_ratings integer;
BEGIN
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, count_ratings
  FROM ratings
  WHERE resource_id = p_resource_id;
  
  UPDATE resources
  SET 
    average_rating = avg_rating,
    rating_count = count_ratings
  WHERE id = p_resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for auto-updating average rating
CREATE OR REPLACE FUNCTION trigger_update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_resource_rating(NEW.resource_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rating_inserted
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_resource_rating();

CREATE TRIGGER on_rating_updated
  AFTER UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_resource_rating();

CREATE TRIGGER on_rating_deleted
  AFTER DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_resource_rating();

CREATE TRIGGER on_rating_timestamp_updated
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Indexes
CREATE INDEX ratings_resource_id_idx ON public.ratings(resource_id);
CREATE INDEX ratings_user_id_idx ON public.ratings(user_id);
CREATE INDEX resources_average_rating_idx ON public.resources(average_rating DESC);
CREATE INDEX resources_filter_idx ON public.resources(semester, resource_type, visibility);
CREATE INDEX ratings_review_text_idx ON public.ratings USING gin(to_tsvector('english', coalesce(review_text, '')));
```

---

## 5. Full-Text Search Indexes

```sql
CREATE INDEX resources_title_search_idx ON public.resources USING gin(to_tsvector('english', title));
CREATE INDEX resources_subject_search_idx ON public.resources USING gin(to_tsvector('english', subject));
CREATE INDEX resources_description_search_idx ON public.resources USING gin(to_tsvector('english', coalesce(description, '')));
```

---

## 6. View/Download Counter Functions

```sql
-- Increment download count
CREATE OR REPLACE FUNCTION increment_download_count(resource_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(resource_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE resources
  SET view_count = view_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Summary

**Tables:** 6 (profiles, resources, tags, resource_tags, ratings, auth.users)  
**Indexes:** 25+  
**Functions:** 5  
**Triggers:** 7  
**RLS Policies:** 15+  

**Storage:** 1 bucket (resource-files)

---

## Quick Setup Order

1. Run User Profiles section
2. Run Resources & Tags section
3. Create Storage Bucket (in Supabase dashboard)
4. Run Storage Bucket policies
5. Run Ratings & Reviews section
6. Run Full-Text Search Indexes
7. Run View/Download Counter Functions

Done! Database is ready.
