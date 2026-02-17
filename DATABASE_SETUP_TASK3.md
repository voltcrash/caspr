# Task 3: Access Control & Privacy Settings - Database Setup

## Database Schema Updates

Run this SQL in your Supabase SQL Editor to add privacy controls:

```sql
-- Add visibility column to resources table
alter table public.resources
add column visibility text not null default 'public' check (visibility in ('public', 'private'));

-- Create index for faster filtering
create index resources_visibility_idx on public.resources(visibility);
create index resources_visibility_college_idx on public.resources(visibility, user_id);

-- Update RLS policy for resources SELECT to check college access
-- First, drop the existing policy
drop policy if exists "Resources are viewable by everyone" on resources;

-- Create new policy with college-based access control
create policy "Resources are viewable with college check"
  on resources for select
  using (
    visibility = 'public'
    or
    (
      visibility = 'private'
      and exists (
        select 1 from profiles as uploader
        where uploader.id = resources.user_id
        and uploader.college = (
          select college from profiles where id = auth.uid()
        )
      )
    )
  );

-- Alternative: If you want unauthenticated users to see public resources only
-- Use this policy instead:
create or replace policy "Public resources viewable by all, private by same college"
  on resources for select
  using (
    visibility = 'public'
    or
    (
      visibility = 'private'
      and auth.uid() is not null
      and exists (
        select 1 from profiles as uploader
        where uploader.id = resources.user_id
        and uploader.college = (
          select college from profiles where id = auth.uid()
        )
      )
    )
  );
```

## Migration for Existing Data

If you already have resources in your database, update them:

```sql
-- Set all existing resources to public (safe default)
update public.resources
set visibility = 'public'
where visibility is null;
```

## Schema Changes Summary

### Updated `resources` table
Now includes:
- `visibility` (text): 'public' or 'private'
  - **public**: Accessible by users from any college
  - **private**: Only accessible by users from the same college as uploader
  - Default: 'public'

### Updated RLS Policies

**Old Policy:**
- Anyone could view all resources

**New Policy:**
- **Public resources**: Everyone can view
- **Private resources**: Only users from the same college as uploader can view
- **Not logged in**: Can only see public resources

### Access Control Logic

```
Resource Visibility Check:
├─ IF visibility = 'public'
│  └─ ✅ Allow access to everyone
│
└─ IF visibility = 'private'
   ├─ Check if user is authenticated
   │  └─ IF NOT authenticated
   │     └─ ❌ Deny access
   │
   └─ Check user's college
      ├─ Get uploader's college from profiles
      ├─ Get current user's college from profiles
      └─ IF colleges match
         └─ ✅ Allow access
      └─ ELSE
         └─ ❌ Deny access
```

## Testing Access Control

### Test Case 1: Public Resource
```sql
-- Create a public resource
-- Anyone should be able to see it
```

### Test Case 2: Private Resource - Same College
```sql
-- User A from "MIT" uploads private resource
-- User B from "MIT" should see it
```

### Test Case 3: Private Resource - Different College
```sql
-- User A from "MIT" uploads private resource
-- User C from "Stanford" should NOT see it
```

### Test Case 4: Not Logged In
```sql
-- Anonymous user should only see public resources
```

## Visual Indicators

Resources will display:
- 🌐 **Public** badge - Green
- 🔒 **Private** badge - Blue
- College name for private resources

## Notes

- Default visibility is 'public' for backward compatibility
- Existing resources will be set to 'public' during migration
- Private resources are only hidden from the list/search, not deleted
- Users can change visibility when editing their own resources
- Access is verified at the database level (RLS), not just in the UI
