-- CASPR Database Fix
-- Run this in Supabase SQL Editor to fix relationship issues

-- 1. Drop and recreate foreign keys properly
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

-- 2. Ensure RLS policies are correct
-- Resources policies
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

-- 3. Fix any orphaned records (resources without valid users)
DELETE FROM public.resources 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 4. Verify email confirmation is ENABLED
-- Go to: Authentication > Providers > Email
-- Make sure "Confirm email" is CHECKED

-- 5. Done!
SELECT 'Database fixed! Now deploy your code changes.' as status;
