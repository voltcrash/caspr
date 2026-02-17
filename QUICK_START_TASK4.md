# Task 4: Search & Filter System - Quick Start Guide

## Overview

This guide will help you set up and test the advanced search & filter system with rating functionality for CASPR.

## Features Implemented

### 🔍 Search Functionality
- Search by resource title
- Search by subject name
- Search by description
- Search by tags (comma-separated)
- Full-text search with PostgreSQL GIN indexes

### 🎯 Filter Options
- **Subject/Course**: Text search for subjects
- **Semester**: Select from 1-8
- **Resource Type**: Notes, Question Papers, Solutions, Project Reports, Study Material
- **Branch/Department**: Filter by uploader's branch
- **Year/Batch**: Filter by year/batch (e.g., 2023, 2024)
- **Privacy Level**: Public only, Private only, or All

### 🔄 Sort Options
- **Latest First**: Most recent uploads (default)
- **Highest Rated**: Resources with best average ratings
- **Most Popular**: Resources with most downloads
- **Most Viewed**: Resources with highest view counts

### ⭐ Rating System
- Users can rate resources 1-5 stars
- Average rating displayed on cards and detail page
- Users can update their own ratings
- Resource owners cannot rate their own resources
- Rating count shown alongside average

### 🎛️ Combined Filters
- All filters work together seamlessly
- Multiple filters can be applied simultaneously
- Efficient query execution with database indexes

---

## Database Setup

### Step 1: Run the SQL Migration

Go to your Supabase Dashboard → SQL Editor and run the following:

```sql
-- Create ratings table
CREATE TABLE public.ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  resource_id uuid REFERENCES public.resources ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  UNIQUE(resource_id, user_id)
);

-- Add average_rating column to resources table
ALTER TABLE public.resources
ADD COLUMN average_rating decimal(3,2) DEFAULT 0.00,
ADD COLUMN rating_count integer DEFAULT 0;

-- Create indexes for ratings
CREATE INDEX ratings_resource_id_idx ON public.ratings(resource_id);
CREATE INDEX ratings_user_id_idx ON public.ratings(user_id);
CREATE INDEX resources_average_rating_idx ON public.resources(average_rating DESC);

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to calculate and update average rating
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

-- Trigger to update average rating when rating is inserted
CREATE OR REPLACE FUNCTION trigger_update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_resource_rating(NEW.resource_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rating_inserted
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_resource_rating();

CREATE TRIGGER on_rating_updated
  AFTER UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_resource_rating();

CREATE TRIGGER on_rating_deleted
  AFTER DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_resource_rating();

-- Updated_at trigger for ratings
CREATE TRIGGER on_rating_timestamp_updated
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Add index for combined filtering
CREATE INDEX resources_filter_idx ON public.resources(
  semester, 
  resource_type, 
  visibility
);

-- Add full-text search indexes
CREATE INDEX resources_title_search_idx ON public.resources USING gin(to_tsvector('english', title));
CREATE INDEX resources_subject_search_idx ON public.resources USING gin(to_tsvector('english', subject));
CREATE INDEX resources_description_search_idx ON public.resources USING gin(to_tsvector('english', coalesce(description, '')));
```

### Step 2: Verify Tables

Run this query to verify the setup:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('resources', 'ratings')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

You should see:
- `resources` table with `average_rating` and `rating_count` columns
- `ratings` table with all columns

---

## Testing the Features

### Test 1: Basic Search

1. Go to `/resources`
2. In the "Search" field, type "data structures"
3. Click "Go"
4. Should show all resources matching the search term in title, subject, or description

### Test 2: Tag Search

1. Upload a resource with tags like "algorithms, database, midterm"
2. Go to `/resources`
3. In the "Search by Tags" field, type "algorithms"
4. Click "Go"
5. Should show all resources tagged with "algorithms"

### Test 3: Combined Filters

Try this combination:
1. Set **Sort By** to "Latest First"
2. Set **Resource Type** to "Class Notes"
3. Set **Semester** to "3"
4. Set **Subject** to "Computer"
5. All filters should work together

### Test 4: Sort Options

Test each sort option:
1. **Latest First** - newest resources at top
2. **Highest Rated** - best-rated resources at top
3. **Most Popular** - most downloaded resources at top
4. **Most Viewed** - most viewed resources at top

### Test 5: Rating System

**As a regular user:**
1. Go to any resource detail page (not your own)
2. Scroll to "Rate this Resource" section
3. Click on a star (1-5)
4. Should see "Rating submitted!" message
5. Your rating is saved and average updates

**As resource owner:**
1. Go to your own resource detail page
2. Try to rate it
3. Should see "You can't rate your own resource" message

**Update rating:**
1. Go back to a resource you rated
2. Click a different star rating
3. Your rating updates (upsert)

### Test 6: Filter by Branch/Department

1. Upload resources from different users with different branches
2. Go to `/resources`
3. In the "Branch/Department" field, type "Computer Science"
4. Should show only resources from CS branch

### Test 7: Filter by Year/Batch

1. Upload resources with different year_batch values
2. Go to `/resources`
3. In the "Year/Batch" field, type "2023"
4. Should show only 2023 batch resources

### Test 8: Privacy Filter

1. Upload some public and some private resources
2. Go to `/resources`
3. Set **Privacy Level** to "Public Only"
4. Should show only public resources
5. Change to "Private Only"
6. Should show only private resources (from your college)

---

## Key Files Modified/Created

### New Components
- `components/resources/RatingStars.tsx` - Interactive star rating component

### Modified Components
- `components/resources/ResourceFilters.tsx` - Enhanced with all filter options
- `components/resources/ResourceList.tsx` - Added rating display on cards
- `app/resources/page.tsx` - Updated to handle all filter parameters
- `app/resources/[id]/page.tsx` - Added rating component

### Modified Server Actions
- `lib/actions/resources.ts` - Enhanced `getResources()` with all filters
- Added `rateResource()` function
- Added `getUserRating()` function

### Modified Types
- `lib/types/database.types.ts` - Added `SortOption`, `Rating` types
- Updated `Resource` type with `average_rating` and `rating_count`

### Documentation
- `DATABASE_SETUP_TASK4.md` - Complete database setup for Task 4

---

## URL Parameters

The resource list page now supports these URL parameters:

```
/resources?subject=Data&semester=3&resource_type=notes&branch=Computer&year_batch=2023&visibility=public&search=algorithms&tags=database,sql&sort=rated
```

**All parameters:**
- `subject` - Filter by subject (partial match)
- `semester` - Filter by semester (1-8)
- `resource_type` - Filter by type (notes, question_papers, etc.)
- `branch` - Filter by uploader's branch (partial match)
- `year_batch` - Filter by year/batch (partial match)
- `visibility` - Filter by privacy (public, private)
- `search` - Search in title, subject, description
- `tags` - Comma-separated tag names
- `sort` - Sort option (latest, rated, popular, most_viewed)

---

## Performance Optimizations

### Indexes Created
1. `ratings_resource_id_idx` - Fast rating lookups by resource
2. `ratings_user_id_idx` - Fast rating lookups by user
3. `resources_average_rating_idx` - Fast sorting by rating
4. `resources_filter_idx` - Composite index for common filters
5. Full-text search indexes on title, subject, description

### Query Optimization
- Branch filter applied post-query (since it's in joined profiles table)
- Tag filter uses junction table efficiently
- All other filters use indexed columns
- Combined filters use AND logic for precision

---

## Common Issues & Solutions

### Issue: Ratings not updating
**Solution:** Check that the database triggers are properly created. Run:
```sql
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname LIKE '%rating%';
```

### Issue: Search not finding resources
**Solution:** Ensure full-text search indexes are created. Verify with:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'resources';
```

### Issue: Sort by rating shows 0-rated resources first
**Solution:** This is expected. Resources with 0 ratings appear at bottom when sorting by rating. The query sorts by `average_rating DESC, rating_count DESC`.

### Issue: Tag search returns too many results
**Solution:** Tag search is case-insensitive and uses exact tag name matching. Make sure tags are consistent (lowercase, no extra spaces).

---

## Next Steps

After completing Task 4, you have:
✅ Advanced search functionality  
✅ Comprehensive filtering system  
✅ Multiple sort options  
✅ Star rating system  
✅ Combined filter support  
✅ Performance-optimized queries  

The platform now provides a complete resource discovery experience with powerful search, filtering, and community feedback through ratings!

---

## Testing Checklist

- [ ] Basic text search works
- [ ] Tag search finds resources
- [ ] All filter dropdowns work
- [ ] Filters combine correctly
- [ ] All 4 sort options work
- [ ] Can rate a resource
- [ ] Can update rating
- [ ] Cannot rate own resource
- [ ] Rating average displays correctly
- [ ] Clear filters button works
- [ ] Multiple tags search works
- [ ] Branch/department filter works
- [ ] Year/batch filter works
- [ ] Privacy filter works
- [ ] Ratings show on resource cards
- [ ] Ratings show on detail page

---

## Summary

Task 4 adds powerful discovery features:
- **Search**: Title, subject, description, tags
- **Filters**: 7 different filter options
- **Sorting**: 4 sort methods
- **Ratings**: 5-star rating system
- **Performance**: Optimized with 9 database indexes

Users can now easily find exactly what they're looking for!
