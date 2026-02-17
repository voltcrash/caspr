# Database Setup Instructions

## Supabase Database Schema

You need to create the following table in your Supabase project:

### 1. Create the `profiles` table

Go to your Supabase Dashboard → SQL Editor and run the following SQL:

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

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
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

### 2. Set up Storage Bucket for Profile Pictures (Optional)

If you want to enable profile picture uploads:

1. Go to Storage in your Supabase Dashboard
2. Create a new bucket called `profile-pictures`
3. Make it public
4. Set up the following policy:

```sql
-- Allow authenticated users to upload their own profile pictures
create policy "Users can upload their own profile pictures"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-pictures' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own profile pictures
create policy "Users can update their own profile pictures"
  on storage.objects for update
  using (
    bucket_id = 'profile-pictures' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to profile pictures
create policy "Profile pictures are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'profile-pictures');
```

### 3. Enable Email Authentication

1. Go to Authentication → Providers in Supabase Dashboard
2. Make sure Email provider is enabled
3. Configure email templates as needed

## Database Schema Overview

### profiles table
- `id` (uuid, primary key): References auth.users.id
- `created_at` (timestamp): Profile creation timestamp
- `updated_at` (timestamp): Last update timestamp
- `email` (text): User's email address
- `name` (text): User's full name
- `college` (text): College/Institution name
- `branch` (text): Branch/Department
- `semester` (integer): Current semester (1-12)
- `year` (integer): Current year (1-6)
- `profile_picture_url` (text, nullable): URL to profile picture
- `bio` (text, nullable): User bio/description
