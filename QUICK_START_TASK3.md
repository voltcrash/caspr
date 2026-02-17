# Quick Start Guide - Task 3: Access Control & Privacy + Dark Mode

## Prerequisites

✅ Task 1 & 2 must be completed  
✅ You must be logged in to test privacy features

---

## Step 1: Set Up Database (REQUIRED!)

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Add visibility column
ALTER TABLE public.resources
ADD COLUMN visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private'));

-- Create index
CREATE INDEX resources_visibility_idx ON public.resources(visibility);

-- Drop old policy
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON resources;

-- Create new policy with college-based access
CREATE POLICY "Resources are viewable with college check"
  ON resources FOR SELECT
  USING (
    visibility = 'public'
    OR
    (
      visibility = 'private'
      AND auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM profiles as uploader
        WHERE uploader.id = resources.user_id
        AND uploader.college = (
          SELECT college FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

-- Set existing resources to public (safe default)
UPDATE public.resources
SET visibility = 'public'
WHERE visibility IS NULL OR visibility = '';
```

---

## Step 2: Start the App

```bash
bun dev
```

Open http://localhost:3000

---

## Step 3: Test Privacy Features

### Test Public Resources
1. Login to your account
2. Click "Upload Resource"
3. Fill in the form
4. Select **🌐 Public** (default)
5. Upload file
6. Resource visible to everyone

### Test Private Resources
1. Upload another resource
2. This time select **🔒 Private**
3. Upload file
4. Note the blue "Private" badge

### Test Access Control

**Scenario 1: Same College Access**
1. User A from "MIT" uploads private resource
2. User B from "MIT" logs in
3. User B can see the private resource ✅

**Scenario 2: Different College (Blocked)**
1. User A from "MIT" uploads private resource
2. User C from "Stanford" logs in
3. User C cannot see the resource ❌
4. Resource is filtered out completely

**Scenario 3: Public Access**
1. Upload resource as Public
2. All users can see it regardless of college ✅

### Test Visual Indicators
1. Browse resources
2. See privacy badges:
   - 🌐 Public (green badge)
   - 🔒 Private (blue badge)
3. Click on a resource
4. See larger privacy indicator in header

### Test Edit Privacy
1. Go to your own resource
2. Click "Edit"
3. Change from Public to Private (or vice versa)
4. Save
5. Privacy badge updates
6. Access control changes immediately

---

## Step 4: Test Dark Mode

### Toggle Theme
1. Look at top-right of resources page
2. Click the theme toggle button:
   - ☀️ Sun icon = Currently dark mode (click to go light)
   - 🌙 Moon icon = Currently light mode (click to go dark)
3. Watch the UI smoothly transition

### Test Persistence
1. Toggle to light mode
2. Refresh the page
3. Theme stays light ✅
4. Toggle back to dark
5. Refresh again
6. Theme stays dark ✅

### Test Different Pages
1. Browse resources (dark mode ✅)
2. View resource details (dark mode ✅)
3. Go to upload form (dark mode ✅)
4. Go to your profile (might need more styling)
5. Check login/register pages

### Default Theme
- App defaults to **dark mode**
- First-time visitors see dark theme
- Can switch to light via toggle

---

## What You Can Test Now

### Privacy Features
- ✅ Upload public resources (everyone sees)
- ✅ Upload private resources (college-only)
- ✅ Edit privacy settings
- ✅ View privacy badges
- ✅ Test cross-college access blocking
- ✅ Verify RLS enforcement

### Dark Mode
- ✅ Toggle between light/dark
- ✅ Theme persistence
- ✅ All major pages support dark mode
- ✅ Forms and inputs in dark mode
- ✅ Resource cards in dark mode
- ✅ Navigation in dark mode

---

## Privacy Badges Guide

### 🌐 Public (Green)
- **Meaning:** Anyone can view this resource
- **Access:** All users from any college
- **Color:** Green badge
- **Icon:** Globe 🌐

### 🔒 Private (Blue)
- **Meaning:** College-only access
- **Access:** Only users from uploader's college
- **Color:** Blue badge
- **Icon:** Lock 🔒

### Where Badges Appear
- ✅ Resource list cards
- ✅ Resource detail header
- ✅ Search results

---

## Dark Mode Features

### Theme Toggle Button
- **Location:** Top-right of resources page header
- **Icons:** 
  - Sun (☀️) when dark
  - Moon (🌙) when light
- **Behavior:** Click to toggle

### What Has Dark Mode
- ✅ Resources page
- ✅ Resource cards
- ✅ Filter sidebar
- ✅ Search inputs
- ✅ Forms (upload/edit)
- ✅ Buttons and badges
- ✅ Navigation headers
- ✅ Background colors
- ✅ Text colors
- ✅ Borders and shadows

### Color Scheme

**Dark Mode:**
- Background: Dark gray (#111827)
- Cards: Gray-800
- Text: White/Light gray
- Borders: Gray-600

**Light Mode:**
- Background: Light gray (#F9FAFB)
- Cards: White
- Text: Dark gray/Black
- Borders: Gray-300

---

## Example Test Scenario

### Complete Privacy Test

1. **Create Test Users:**
   - User A: "John" from "MIT"
   - User B: "Jane" from "MIT"  
   - User C: "Bob" from "Stanford"

2. **Upload Resources (as User A - MIT):**
   - Resource 1: "Data Structures Notes" → Public
   - Resource 2: "MIT Internal Exam" → Private

3. **Test as User B (MIT):**
   - Can see both resources ✅
   - Public badge on Resource 1
   - Private badge on Resource 2

4. **Test as User C (Stanford):**
   - Can see Resource 1 only ✅
   - Resource 2 hidden completely ❌
   - No error, just filtered out

5. **Test as Guest (not logged in):**
   - Can see Resource 1 only ✅
   - Cannot see Resource 2 ❌

### Complete Dark Mode Test

1. **Initial State:**
   - Open app → Dark mode by default
   - Sun icon (☀️) visible

2. **Switch to Light:**
   - Click sun icon
   - UI transitions to light
   - Moon icon (🌙) appears

3. **Test Persistence:**
   - Refresh page
   - Still light mode ✅
   - Navigate to different pages
   - Still light mode ✅

4. **Switch Back:**
   - Click moon icon
   - Back to dark mode
   - Sun icon (☀️) returns

---

## Troubleshooting

### Privacy Not Working
- Check database: Verify `visibility` column exists
- Check RLS policy: Run the policy SQL again
- Check profile: Make sure users have college set
- Check browser console for errors

### Dark Mode Not Working
- Clear browser cache
- Check localStorage (should have "theme" key)
- Refresh the page
- Check browser console for errors

### Badges Not Showing
- Check that resource has visibility field
- Run migration SQL to set existing resources
- Refresh the page
- Check network tab for resource data

### Wrong Access (Security Issue)
- Verify RLS policy is active
- Check Supabase logs
- Test with different users
- Verify college names match exactly

---

## Database Verification

After running SQL, check in Supabase:

1. **Table Editor** → resources
   - Should see `visibility` column
   - Values should be 'public' or 'private'

2. **Authentication** → Policies
   - Should see new policy: "Resources are viewable with college check"
   - Old policy should be gone

3. **Test Query:**
   ```sql
   SELECT title, visibility, user_id
   FROM resources
   LIMIT 10;
   ```

---

## Quick Commands

### Check Theme in Console
```javascript
localStorage.getItem('theme')
// Should return: "dark" or "light"
```

### Force Dark Mode
```javascript
localStorage.setItem('theme', 'dark')
location.reload()
```

### Force Light Mode
```javascript
localStorage.setItem('theme', 'light')
location.reload()
```

---

## Next Steps

After testing:
1. ✅ Privacy control works
2. ✅ Dark mode works
3. ✅ Ready to deploy
4. ✅ Push to Git
5. ✅ Deploy to Vercel

---

**Ready to test?** Run the database SQL (Step 1), then `bun dev`!

For detailed implementation, see `TASK3_COMPLETE.md`.
