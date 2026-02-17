# Task 2: Resource Upload & Management - Database Setup

## Database Schema for Resources

Run this SQL in your Supabase SQL Editor:

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
  
  -- User who uploaded
  user_id uuid references auth.users on delete cascade not null,
  
  -- Resource information
  title text not null,
  description text,
  subject text not null,
  semester integer not null check (semester >= 1 and semester <= 12),
  year_batch text not null,
  resource_type resource_type not null,
  
  -- File information
  file_url text not null,
  file_name text not null,
  file_size bigint not null,
  file_type text not null,
  
  -- Metadata
  download_count integer default 0 not null,
  view_count integer default 0 not null
);

-- Create tags table
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create junction table for resource-tags (many-to-many)
create table public.resource_tags (
  resource_id uuid references public.resources on delete cascade not null,
  tag_id uuid references public.tags on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (resource_id, tag_id)
);

-- Create indexes for better query performance
create index resources_user_id_idx on public.resources(user_id);
create index resources_subject_idx on public.resources(subject);
create index resources_semester_idx on public.resources(semester);
create index resources_resource_type_idx on public.resources(resource_type);
create index resources_created_at_idx on public.resources(created_at desc);
create index tags_name_idx on public.tags(name);
create index resource_tags_resource_id_idx on public.resource_tags(resource_id);
create index resource_tags_tag_id_idx on public.resource_tags(tag_id);

-- Enable Row Level Security
alter table public.resources enable row level security;
alter table public.tags enable row level security;
alter table public.resource_tags enable row level security;

-- RLS Policies for resources
-- Anyone can view resources
create policy "Resources are viewable by everyone"
  on resources for select
  using (true);

-- Authenticated users can insert resources
create policy "Authenticated users can insert resources"
  on resources for insert
  with check (auth.uid() = user_id);

-- Users can update their own resources
create policy "Users can update their own resources"
  on resources for update
  using (auth.uid() = user_id);

-- Users can delete their own resources
create policy "Users can delete their own resources"
  on resources for delete
  using (auth.uid() = user_id);

-- RLS Policies for tags
-- Anyone can view tags
create policy "Tags are viewable by everyone"
  on tags for select
  using (true);

-- Authenticated users can insert tags
create policy "Authenticated users can insert tags"
  on tags for insert
  with check (auth.role() = 'authenticated');

-- RLS Policies for resource_tags
-- Anyone can view resource_tags
create policy "Resource tags are viewable by everyone"
  on resource_tags for select
  using (true);

-- Authenticated users can insert resource_tags for their own resources
create policy "Users can insert tags for their own resources"
  on resource_tags for insert
  with check (
    exists (
      select 1 from resources
      where resources.id = resource_tags.resource_id
      and resources.user_id = auth.uid()
    )
  );

-- Users can delete tags from their own resources
create policy "Users can delete tags from their own resources"
  on resource_tags for delete
  using (
    exists (
      select 1 from resources
      where resources.id = resource_tags.resource_id
      and resources.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for resources
create trigger on_resource_updated
  before update on public.resources
  for each row
  execute procedure public.handle_updated_at();

-- Function to increment download count
create or replace function increment_download_count(resource_id uuid)
returns void as $$
begin
  update resources
  set download_count = download_count + 1
  where id = resource_id;
end;
$$ language plpgsql security definer;

-- Function to increment view count
create or replace function increment_view_count(resource_id uuid)
returns void as $$
begin
  update resources
  set view_count = view_count + 1
  where id = resource_id;
end;
$$ language plpgsql security definer;
```

## Storage Bucket Setup

### 1. Create Storage Bucket for Resource Files

1. Go to your Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Bucket name: `resource-files`
4. Make it **Public** (so files can be downloaded)
5. Click "Create bucket"

### 2. Set Up Storage Policies

After creating the bucket, go to Policies tab and add these:

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

## Schema Overview

### `resources` table
- **id**: UUID primary key
- **created_at**: Timestamp
- **updated_at**: Timestamp
- **user_id**: Foreign key to auth.users
- **title**: Resource title
- **description**: Optional description
- **subject**: Subject/Course name
- **semester**: Semester (1-12)
- **year_batch**: Year/Batch (e.g., "2023-2024")
- **resource_type**: Enum (notes, question_papers, solutions, project_reports, study_material)
- **file_url**: Supabase Storage URL
- **file_name**: Original filename
- **file_size**: File size in bytes
- **file_type**: MIME type
- **download_count**: Number of downloads
- **view_count**: Number of views

### `tags` table
- **id**: UUID primary key
- **name**: Tag name (unique)
- **created_at**: Timestamp

### `resource_tags` table (junction table)
- **resource_id**: Foreign key to resources
- **tag_id**: Foreign key to tags
- **created_at**: Timestamp

## File Storage Structure

Files will be stored in Supabase Storage with this structure:
```
resource-files/
  ├── {user_id}/
  │   ├── {resource_id}_filename.pdf
  │   ├── {resource_id}_filename.docx
  │   └── ...
```

## Supported File Types

- **Documents**: PDF, DOCX, DOC, TXT
- **Presentations**: PPT, PPTX
- **Images**: JPG, JPEG, PNG, GIF
- **Spreadsheets**: XLSX, XLS, CSV
- **Archives**: ZIP, RAR

## Notes

- All resources are publicly viewable (but only owners can edit/delete)
- Files are organized by user_id for easy management
- Download and view counts are tracked
- Tags enable powerful search functionality
- RLS ensures users can only modify their own content
