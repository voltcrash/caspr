# Quick Start Guide - Task 2: Resource Upload & Management

## Prerequisites

✅ Task 1 must be completed (authentication system)  
✅ You must be logged in to upload resources

## Step 1: Set Up Database (IMPORTANT!)

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Create resource_types enum
create type resource_type as enum (
  'notes',
  'question_papers',
  'solutions',
  'project_reports',
  'study_material'
);

-- Create resources table
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  subject text not null,
  semester integer not null check (semester >= 1 and semester <= 12),
  year_batch text not null,
  resource_type resource_type not null,
  file_url text not null,
  file_name text not null,
  file_size bigint not null,
  file_type text not null,
  download_count integer default 0 not null,
  view_count integer default 0 not null
);

-- Create tags table
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create resource_tags junction table
create table public.resource_tags (
  resource_id uuid references public.resources on delete cascade not null,
  tag_id uuid references public.tags on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (resource_id, tag_id)
);

-- Create indexes
create index resources_user_id_idx on public.resources(user_id);
create index resources_subject_idx on public.resources(subject);
create index resources_semester_idx on public.resources(semester);
create index resources_resource_type_idx on public.resources(resource_type);
create index resources_created_at_idx on public.resources(created_at desc);
create index tags_name_idx on public.tags(name);
create index resource_tags_resource_id_idx on public.resource_tags(resource_id);
create index resource_tags_tag_id_idx on public.resource_tags(tag_id);

-- Enable RLS
alter table public.resources enable row level security;
alter table public.tags enable row level security;
alter table public.resource_tags enable row level security;

-- Resources policies
create policy "Resources are viewable by everyone"
  on resources for select using (true);

create policy "Authenticated users can insert resources"
  on resources for insert with check (auth.uid() = user_id);

create policy "Users can update their own resources"
  on resources for update using (auth.uid() = user_id);

create policy "Users can delete their own resources"
  on resources for delete using (auth.uid() = user_id);

-- Tags policies
create policy "Tags are viewable by everyone"
  on tags for select using (true);

create policy "Authenticated users can insert tags"
  on tags for insert with check (auth.role() = 'authenticated');

-- Resource tags policies
create policy "Resource tags are viewable by everyone"
  on resource_tags for select using (true);

create policy "Users can insert tags for their own resources"
  on resource_tags for insert with check (
    exists (
      select 1 from resources
      where resources.id = resource_tags.resource_id
      and resources.user_id = auth.uid()
    )
  );

create policy "Users can delete tags from their own resources"
  on resource_tags for delete using (
    exists (
      select 1 from resources
      where resources.id = resource_tags.resource_id
      and resources.user_id = auth.uid()
    )
  );

-- Triggers
create trigger on_resource_updated
  before update on public.resources
  for each row
  execute procedure public.handle_updated_at();

-- Functions for counters
create or replace function increment_download_count(resource_id uuid)
returns void as $$
begin
  update resources
  set download_count = download_count + 1
  where id = resource_id;
end;
$$ language plpgsql security definer;

create or replace function increment_view_count(resource_id uuid)
returns void as $$
begin
  update resources
  set view_count = view_count + 1
  where id = resource_id;
end;
$$ language plpgsql security definer;
```

## Step 2: Set Up Supabase Storage

### 2.1 Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click "Create a new bucket"
3. Name: `resource-files`
4. **Make it Public** (check the box)
5. Click "Create bucket"

### 2.2 Add Storage Policies

Go to the Storage bucket → Policies tab, then run this SQL:

```sql
-- Allow authenticated users to upload files
create policy "Authenticated users can upload resource files"
  on storage.objects for insert
  with check (
    bucket_id = 'resource-files' 
    and auth.role() = 'authenticated'
  );

-- Allow users to update their own files
create policy "Users can update their own resource files"
  on storage.objects for update
  using (
    bucket_id = 'resource-files' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
create policy "Users can delete their own resource files"
  on storage.objects for delete
  using (
    bucket_id = 'resource-files' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to download files
create policy "Resource files are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'resource-files');
```

## Step 3: Start the App

```bash
bun dev
```

Open http://localhost:3000

## Step 4: Test the Features

### Test Upload
1. Login to your account
2. Click **"Upload Resource"** button
3. Fill out the form:
   - Select a file (PDF, DOCX, image, etc.)
   - Title: "Data Structures Complete Notes"
   - Subject: "Data Structures"
   - Semester: 3
   - Resource Type: "Class Notes"
   - Year/Batch: "2023-2024"
   - Description: "Complete notes covering all topics"
   - Tags: "arrays, linked-lists, trees"
4. Click **"Upload Resource"**
5. Watch the progress bar
6. You'll be redirected to resources list

### Test Browse
1. You should see your uploaded resource in the list
2. Try the filters:
   - Filter by resource type
   - Filter by semester
   - Search by title
3. Click on your resource to view details

### Test Resource Detail
1. Click on any resource card
2. See full information
3. Click **"Download Resource"** to download the file
4. View counter increments
5. Download counter increments on download

### Test Edit
1. Go to your own resource
2. Click **"Edit"** button (only visible for your uploads)
3. Modify title, description, or tags
4. Click **"Save Changes"**
5. Verify changes are saved

### Test Delete
1. Go to your own resource
2. Click **"Delete"** button
3. Confirm deletion in modal
4. Resource is deleted
5. File is removed from storage

### Test Filters
1. Go to resources page
2. Use sidebar filters:
   - Select "Question Papers" type
   - Select "Semester 3"
   - Enter subject name
3. See filtered results
4. Click "Clear All Filters"

### Test Tags
1. Upload a resource with tags: "arrays, trees, graphs"
2. View the resource detail page
3. Tags appear as badges
4. Edit the resource and modify tags
5. Tags update correctly

## What You Can Do Now

### As Any User (Including Not Logged In)
- ✅ Browse all resources
- ✅ View resource details
- ✅ Download files
- ✅ Filter by type, semester, subject
- ✅ Search resources

### As Logged In User
- ✅ Upload new resources
- ✅ Edit your own resources
- ✅ Delete your own resources
- ✅ Add tags to resources

## Supported File Types

- **Documents**: PDF, DOCX, DOC, TXT
- **Presentations**: PPT, PPTX
- **Spreadsheets**: XLSX, XLS, CSV
- **Images**: JPG, JPEG, PNG, GIF
- **Archives**: ZIP, RAR

**Max File Size:** 50MB

## Navigation

- **Homepage** → Redirects to Resources (if logged in)
- **Resources** → Browse all resources
- **Upload Resource** → Upload new resource (requires login)
- **My Profile** → View your profile
- **Resource Detail** → Click any resource card
- **Edit Resource** → Click "Edit" on your resources
- **Delete Resource** → Click "Delete" on your resources

## Troubleshooting

### "Failed to upload file"
- Check that you created the `resource-files` bucket in Supabase Storage
- Make sure the bucket is **Public**
- Verify storage policies are in place

### "Database error" when uploading
- Make sure you ran all the SQL commands
- Check that the `resources`, `tags`, and `resource_tags` tables exist
- Verify RLS policies are enabled

### Can't see uploaded resource
- Check if resource was created in Supabase → Table Editor → resources
- Try refreshing the page
- Check browser console for errors

### File upload is very slow
- Check your internet connection
- Supabase free tier has bandwidth limits
- Try a smaller file

### "Permission denied" errors
- Make sure you're logged in
- Check that RLS policies are correctly set up
- Verify you're trying to edit/delete your own resource

## Database Verification

After running the SQL, verify in Supabase Dashboard → Table Editor:

1. **resources** table exists with correct columns
2. **tags** table exists
3. **resource_tags** table exists
4. Go to Storage → resource-files bucket exists and is public

## Example Test Flow

1. **Register/Login** → Create account or login
2. **Upload** → Upload a test PDF with tags
3. **Browse** → See your resource in the list
4. **Filter** → Test filtering by semester
5. **View** → Click resource to see details
6. **Download** → Download the file
7. **Edit** → Change the title
8. **Delete** → Delete the resource

---

**Ready to test?** Complete Steps 1-2 (database + storage setup), then run `bun dev`!

For detailed database setup, see `DATABASE_SETUP_TASK2.md`.
