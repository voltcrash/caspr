# Quick Start Guide

## Task 1: User Authentication & Profiles - COMPLETE ✅

Everything is set up and ready to go! Follow these steps to test the authentication system.

## Before You Start

You need to set up the database schema in Supabase. **This is the only manual step required.**

## Step 1: Set Up Database (IMPORTANT!)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (the one with URL: `hrquclznwqpjkujtopri.supabase.co`)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  name text not null,
  college text not null,
  branch text not null,
  semester integer not null check (semester >= 1 and semester <= 12),
  year integer not null check (year >= 1 and year <= 6),
  profile_picture_url text,
  bio text
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Allow users to read all profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

-- Allow users to insert their own profile
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();
```

6. Click **Run** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
7. You should see "Success. No rows returned"

## Step 2: Start the Development Server

```bash
bun dev
```

The app will start at http://localhost:3000

## Step 3: Test the Application

### Test Registration
1. Open http://localhost:3000
2. Click **"Sign Up"** or **"Get Started"**
3. Fill out the registration form:
   - Email: `test@example.com`
   - Password: `password123` (at least 6 characters)
   - Confirm Password: `password123`
   - Name: `John Doe`
   - College: `MIT`
   - Branch: `Computer Science Engineering`
   - Year: Select any year
   - Semester: Select any semester
4. Click **"Create account"**
5. You should be redirected to your profile page

### Test Profile View
- You should see your profile information displayed nicely
- Profile picture shows your initial (since no URL was provided)
- All information is displayed correctly

### Test Profile Edit
1. Click **"Edit Profile"**
2. Modify any information (try adding a bio!)
3. Click **"Save Changes"**
4. You'll be redirected back to profile view
5. Verify your changes are saved

### Test Logout
1. Click **"Logout"** button
2. You'll be redirected to the login page

### Test Login
1. Enter your email: `test@example.com`
2. Enter your password: `password123`
3. Click **"Sign in"**
4. You should be back at your profile page

### Test Session Persistence
1. While logged in, refresh the page
2. You should remain logged in (not redirected to login)

### Test Protected Routes
1. Logout
2. Try to visit http://localhost:3000/profile directly
3. You should be redirected to login

## What's Included

✅ **Registration System**
- Beautiful, responsive form
- Field validation
- Password confirmation
- All required profile fields

✅ **Login System**
- Simple, clean interface
- Error handling
- Secure authentication

✅ **User Profile**
- View all profile information
- Edit functionality
- Optional profile picture (URL-based)
- Optional bio
- Shows member since date

✅ **Session Management**
- Persistent sessions
- Automatic token refresh
- Protected routes
- Middleware-based security

✅ **Landing Page**
- Beautiful hero section
- Features overview
- Call-to-action buttons

## Project Structure

```
Key files you should know about:

📁 app/
  ├── login/page.tsx          → Login page
  ├── register/page.tsx       → Registration page
  ├── profile/page.tsx        → Profile view (protected)
  └── profile/edit/page.tsx   → Edit profile (protected)

📁 lib/
  ├── actions/auth.ts         → Server actions (signup, login, etc.)
  ├── supabase/               → Supabase configuration
  └── types/database.types.ts → TypeScript types

📁 components/
  ├── profile/                → Profile components
  └── providers/              → Auth context provider
```

## Troubleshooting

### "Failed to create user" error
- Make sure you ran the database setup SQL in Supabase
- Check that the profiles table was created successfully

### Can't login after registration
- Check Supabase dashboard → Authentication → Users
- Make sure your user was created
- Try resetting password if needed

### Session not persisting
- Clear browser cookies
- Try in incognito/private mode
- Check that .env.local has correct Supabase credentials

### Profile not showing after login
- Check Supabase dashboard → Table Editor → profiles
- Make sure your profile record was created
- Check browser console for errors

## Database Check

To verify your database is set up correctly:

1. Go to Supabase Dashboard → Table Editor
2. You should see a table called `profiles`
3. Click on it to see the columns:
   - id (uuid)
   - created_at (timestamptz)
   - updated_at (timestamptz)
   - email (text)
   - name (text)
   - college (text)
   - branch (text)
   - semester (int4)
   - year (int4)
   - profile_picture_url (text, nullable)
   - bio (text, nullable)

## Need Help?

- Check `DATABASE_SETUP.md` for detailed database setup instructions
- Check `README.md` for full project documentation
- Check `TASK1_COMPLETE.md` for implementation details

## What's Next?

Task 1 is complete! The authentication system is fully functional and ready for future features:

- Resource upload system
- Search and filtering
- Rating system
- File storage
- And more...

---

**Ready to test?** Just set up the database (Step 1) and run `bun dev`!
