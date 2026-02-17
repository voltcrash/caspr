# Task 5: Rating & Review System - Database Setup

## Overview

This extends Task 4's star rating system to include written text reviews and comprehensive review management.

## Database Schema Updates

Run this SQL in your Supabase SQL Editor:

```sql
-- Add review_text column to ratings table
ALTER TABLE public.ratings
ADD COLUMN review_text text;

-- Create index for review searches (optional, for future features)
CREATE INDEX ratings_review_text_idx ON public.ratings USING gin(to_tsvector('english', coalesce(review_text, '')));

-- Update the ratings table comment
COMMENT ON COLUMN public.ratings.review_text IS 'Optional written review/comment about the resource';
```

## Schema Overview

### Updated `ratings` Table

The `ratings` table now includes:

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | AUTO |
| created_at | timestamp | Creation time | AUTO |
| updated_at | timestamp | Last update time | AUTO |
| resource_id | uuid | FK to resources | NOT NULL |
| user_id | uuid | FK to auth.users | NOT NULL |
| rating | integer | Star rating (1-5) | NOT NULL, CHECK (1-5) |
| review_text | text | Written review | NULLABLE |
| | | UNIQUE(resource_id, user_id) | |

### Review Features

#### One Review Per User
- UNIQUE constraint on (resource_id, user_id)
- Users can update both rating and review text
- Enforced at database level

#### Optional Review Text
- `review_text` column is nullable
- Users can rate without reviewing
- Users can add review text later
- Users can update review text anytime

#### Review Display
- Reviews ordered by created_at DESC (newest first)
- Show reviewer name, rating, and text
- Show "edited" indicator if updated_at > created_at + 1 minute

---

## RLS Policies

Existing policies remain the same:

```sql
-- View all reviews (already exists)
"Ratings are viewable by everyone"

-- Submit review (already exists)
"Authenticated users can insert ratings"

-- Update own review (already exists)
"Users can update their own ratings"

-- Delete own review (already exists)
"Users can delete their own ratings"
```

---

## Validation Rules

### Rating Validation
- ✅ Rating: Required, 1-5 stars
- ✅ Review text: Optional, max length handled by UI
- ✅ One review per user per resource
- ✅ Only authenticated users can review
- ✅ Cannot review own resources (enforced in app)

### Update Rules
- ✅ Users can update rating
- ✅ Users can update review text
- ✅ Users can add review text to existing rating
- ✅ Users can remove review text (set to null/empty)
- ✅ Updated_at timestamp updates automatically

---

## Query Examples

### Get All Reviews for a Resource
```sql
SELECT 
  r.*,
  p.name as reviewer_name,
  p.college as reviewer_college,
  p.branch as reviewer_branch
FROM ratings r
JOIN profiles p ON r.user_id = p.id
WHERE r.resource_id = 'resource-uuid'
ORDER BY r.created_at DESC;
```

### Get User's Review for a Resource
```sql
SELECT *
FROM ratings
WHERE resource_id = 'resource-uuid'
  AND user_id = 'user-uuid';
```

### Get Resources with Most Reviews
```sql
SELECT 
  res.id,
  res.title,
  res.average_rating,
  COUNT(rat.id) as review_count
FROM resources res
LEFT JOIN ratings rat ON res.id = rat.resource_id
WHERE rat.review_text IS NOT NULL
GROUP BY res.id
ORDER BY review_count DESC;
```

### Get Recent Reviews
```sql
SELECT 
  r.*,
  res.title as resource_title,
  p.name as reviewer_name
FROM ratings r
JOIN resources res ON r.resource_id = res.id
JOIN profiles p ON r.user_id = p.id
WHERE r.review_text IS NOT NULL
ORDER BY r.created_at DESC
LIMIT 10;
```

---

## Performance Considerations

### Indexes
- `ratings_resource_id_idx` - Fast review lookups by resource (exists)
- `ratings_user_id_idx` - Fast user review history (exists)
- `ratings_review_text_idx` - Full-text search on reviews (new, optional)

### Query Optimization
- JOIN with profiles for reviewer info
- Filter by resource_id first (indexed)
- LIMIT queries to reasonable page size
- Cache review counts on resources table

---

## Migration Notes

### For Existing Data
- Existing ratings will have `review_text = NULL`
- This is expected and valid
- Users can add review text when editing
- No data migration needed

### Backward Compatibility
- ✅ All existing ratings work unchanged
- ✅ Average rating calculations unchanged
- ✅ Existing UI shows ratings without reviews
- ✅ New UI shows reviews when available

---

## Review Guidelines (For UI)

### Character Limits (Recommended)
- Minimum: 10 characters (optional)
- Maximum: 1000 characters (enforced in UI)
- Display: Show first 200 chars, "Read more" for longer

### Content Moderation (Future)
- No profanity filter (could be added)
- No spam detection (could be added)
- User reporting system (future enhancement)

### Review Quality Tips (Show in UI)
- "Be specific and constructive"
- "Mention what was helpful or not"
- "Respectful feedback helps everyone"
- "Focus on the resource quality"

---

## Statistics

### New Columns: 1
- `review_text` (text, nullable)

### New Indexes: 1
- `ratings_review_text_idx` (optional, GIN)

### Modified Tables: 1
- `ratings` (added column)

### RLS Policies: 0 new
- Existing policies cover review text

### Triggers: 0 new
- Existing triggers work with review text

---

## Testing Queries

### Test 1: Add Review with Text
```sql
INSERT INTO ratings (resource_id, user_id, rating, review_text)
VALUES (
  'resource-uuid',
  'user-uuid',
  5,
  'Excellent notes! Very helpful for exam prep.'
)
ON CONFLICT (resource_id, user_id)
DO UPDATE SET
  rating = EXCLUDED.rating,
  review_text = EXCLUDED.review_text,
  updated_at = now();
```

### Test 2: Update Review Text Only
```sql
UPDATE ratings
SET review_text = 'Updated review text here'
WHERE resource_id = 'resource-uuid'
  AND user_id = 'user-uuid';
```

### Test 3: Get Reviews with Reviewer Info
```sql
SELECT 
  r.rating,
  r.review_text,
  r.created_at,
  r.updated_at,
  p.name,
  p.college
FROM ratings r
JOIN profiles p ON r.user_id = p.id
WHERE r.resource_id = 'resource-uuid'
  AND r.review_text IS NOT NULL
ORDER BY r.created_at DESC;
```

---

## Security Considerations

### Input Validation
- Review text sanitized (HTML escaped)
- Maximum length enforced
- XSS prevention in UI
- No executable code allowed

### Privacy
- Reviewer name shown (from profile)
- Reviewer email NOT shown
- Reviewer ID NOT exposed in UI
- Reviews are public (anyone can view)

### Abuse Prevention
- One review per user per resource
- Must be authenticated to review
- Cannot review own resources
- Can delete own review anytime

---

## Future Enhancements

### Potential Features
1. **Review Helpfulness** - "Was this review helpful?" votes
2. **Review Replies** - Resource owners can reply to reviews
3. **Review Moderation** - Flag inappropriate reviews
4. **Review Photos** - Attach images to reviews
5. **Review Verification** - Mark reviewers who downloaded
6. **Review Analytics** - Track review sentiment
7. **Review Sorting** - Most helpful, newest, highest/lowest rating
8. **Review Filtering** - Show only 5-star, 4-star, etc.

---

## Summary

Task 5 extends Task 4's rating system with:

✅ **Written Reviews** - Optional text reviews  
✅ **Review Display** - Show all reviews per resource  
✅ **Review Editing** - Update rating and text anytime  
✅ **One Review Per User** - Enforced at DB level  
✅ **Rating Summary** - Already implemented in Task 4  

**Implementation**: Simple column addition + UI updates  
**Migration**: Zero downtime, backward compatible  
**Performance**: Indexed and optimized  
