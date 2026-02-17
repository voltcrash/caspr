# Task 4: Search & Filter System - Database Setup

## Database Schema Updates

Run this SQL in your Supabase SQL Editor to add rating system:

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
-- Anyone can view ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

-- Authenticated users can insert ratings
CREATE POLICY "Authenticated users can insert ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own ratings
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

-- Add index for combined filtering (performance optimization)
CREATE INDEX resources_filter_idx ON public.resources(
  semester, 
  resource_type, 
  visibility
);

-- Add full-text search index for better search performance
CREATE INDEX resources_title_search_idx ON public.resources USING gin(to_tsvector('english', title));
CREATE INDEX resources_subject_search_idx ON public.resources USING gin(to_tsvector('english', subject));
CREATE INDEX resources_description_search_idx ON public.resources USING gin(to_tsvector('english', coalesce(description, '')));
```

## Schema Overview

### New `ratings` Table
- **id**: UUID primary key
- **created_at**: Timestamp
- **updated_at**: Timestamp
- **resource_id**: Foreign key to resources
- **user_id**: Foreign key to auth.users
- **rating**: Integer (1-5 stars)
- **Unique constraint**: One rating per user per resource

### Updated `resources` Table
New columns:
- **average_rating**: Decimal (0.00 to 5.00)
- **rating_count**: Integer (number of ratings)

### New Indexes
1. `ratings_resource_id_idx` - Fast rating lookups
2. `ratings_user_id_idx` - User rating history
3. `resources_average_rating_idx` - Sort by rating
4. `resources_filter_idx` - Combined filter queries
5. Full-text search indexes for title, subject, description

---

## Search & Filter Features

### Search Capabilities
✅ Search by resource title  
✅ Search by subject name  
✅ Search by description  
✅ Search by tags (via junction table)  
✅ Full-text search (PostgreSQL GIN indexes)

### Filter Options
✅ Subject/Course  
✅ Semester (1-8)  
✅ Resource type (Notes, Papers, Solutions, etc.)  
✅ Branch/Department  
✅ Year/Batch  
✅ Privacy level (Public/Private)

### Sort Options
✅ Latest uploads (created_at DESC) - Default  
✅ Most popular (download_count DESC)  
✅ Highest rated (average_rating DESC)  
✅ Most viewed (view_count DESC)

### Combined Filters
✅ All filters work together  
✅ Efficient query execution  
✅ Indexed for performance

---

## Query Examples

### Basic Search
```sql
SELECT * FROM resources
WHERE title ILIKE '%data structures%'
  OR subject ILIKE '%data structures%';
```

### Combined Filters
```sql
SELECT * FROM resources
WHERE semester = 3
  AND resource_type = 'notes'
  AND visibility = 'public'
  AND subject ILIKE '%computer%'
ORDER BY created_at DESC;
```

### Search with Tags
```sql
SELECT DISTINCT r.* 
FROM resources r
LEFT JOIN resource_tags rt ON r.id = rt.resource_id
LEFT JOIN tags t ON rt.tag_id = t.id
WHERE t.name ILIKE '%algorithms%'
ORDER BY r.created_at DESC;
```

### Sort by Rating
```sql
SELECT * FROM resources
WHERE semester = 5
ORDER BY average_rating DESC, rating_count DESC;
```

---

## Performance

### Indexes Created
- 7 new indexes for filters and sorting
- Full-text search indexes (GIN)
- Composite index for common filters
- **Total:** 20 indexes across all tables

### Query Optimization
- Indexed columns for WHERE clauses
- Indexed columns for ORDER BY clauses
- Efficient JOIN operations
- Minimal table scans

---

## Rating System

### How Ratings Work
1. User rates resource (1-5 stars)
2. Trigger calculates new average
3. Updates `average_rating` and `rating_count`
4. Display on resource cards and details

### Rating Display
```
Resource Card:
⭐ 4.5 (12 ratings)
```

### Rating Constraints
- One rating per user per resource
- Must be 1-5 stars
- Can update own rating
- Can delete own rating

---

## Notes

- All existing queries automatically benefit from new indexes
- Full-text search provides better search results
- Rating system is optional (resources show 0.00 if not rated)
- Filters are additive (AND logic, not OR)
- Empty filters = show all results
