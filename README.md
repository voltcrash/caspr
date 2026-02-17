# CASPR - Campus Academic Resource Sharing Platform

A Next.js-based platform for students to share and access academic resources like past question papers, class notes, study materials, reference books, project reports, and assignment solutions.

## Features Implemented

### ✅ Task 1: User Authentication & Profiles

- **Registration System**: Complete signup flow with email/password authentication
- **Login System**: Secure login with Supabase authentication
- **User Profiles**: Each user has a comprehensive profile containing:
  - Name
  - Email
  - College/Institution name
  - Branch/Department
  - Current semester (1-12)
  - Current year (1-6)
  - Profile picture URL (optional)
  - Bio (optional)
- **Session Management**: Persistent sessions across browser sessions using Supabase Auth
- **Profile Management**: Users can view and edit their profile information

### ✅ Task 2: Resource Upload & Management

- **File Upload**: Upload academic resources (PDF, DOCX, PPT, images, ZIP, etc.) up to 50MB
- **Resource Information**: Complete metadata for each resource:
  - Title, Subject, Semester, Year/Batch
  - Resource type (Notes, Question Papers, Solutions, Project Reports, Study Material)
  - Optional description
- **Tags/Keywords**: Add searchable tags to resources for better discovery
- **Browse & Filter**: View all resources with filters by type, semester, subject
- **Search**: Search resources by title and description
- **Edit/Delete**: Users can manage their own uploaded resources
- **Download Tracking**: Track views and downloads for each resource
- **File Storage**: Secure storage using Supabase Storage with automatic cleanup

### ✅ Task 3: Access Control & Privacy + Dark Mode

- **Private Access**: Resources marked 'Private' can only be accessed by users from the SAME college/institution
- **Public Access**: Resources marked 'Public' can be accessed by users from ANY college/institution
- **Default Setting**: Allow uploader to choose privacy level during upload
- **Access Verification**: System verifies user's college before granting access to private resources
- **Visual Indicators**: Clear badges show which resources are Private vs Public
- **Dark Mode**: Complete dark theme with toggle button and localStorage persistence
- **Theme Toggle**: Smooth transition between light and dark modes

### ✅ Task 4: Search & Filter System

- **Advanced Search**: Search by title, subject, description, and tags
- **Filter Options**: 
  - Subject/Course (text search)
  - Semester (1-8)
  - Resource type (Notes, Question Papers, etc.)
  - Branch/Department (from uploader's profile)
  - Year/Batch (e.g., 2023, 2024)
  - Privacy level (Public/Private)
- **Sort Options**: 
  - Latest uploads (most recent first)
  - Highest rated (best average ratings)
  - Most popular (highest download counts)
  - Most viewed (highest view counts)
- **Tag Search**: Search resources by comma-separated tags
- **Combined Filters**: All filters work together seamlessly
- **Rating System**: 
  - 5-star rating system for resources
  - Average rating and rating count display
  - Users can rate and update ratings
  - Resource owners cannot rate their own resources
  - Automatic calculation of average ratings
- **Performance**: Optimized with 9 database indexes for fast queries

## Tech Stack

- **Frontend**: Next.js 16.1.6 with App Router, TypeScript, React 19
- **Backend**: Supabase (Authentication & Database)
- **Styling**: Tailwind CSS v4
- **Package Manager**: Bun

## Project Structure

```
caspr/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Registration page
│   ├── profile/
│   │   ├── page.tsx            # Profile view page
│   │   └── edit/page.tsx       # Profile edit page
│   ├── resources/
│   │   ├── page.tsx            # Browse resources
│   │   ├── upload/page.tsx     # Upload resource
│   │   └── [id]/
│   │       ├── page.tsx        # Resource detail
│   │       └── edit/page.tsx   # Edit resource
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/
│   ├── profile/
│   │   ├── ProfileView.tsx     # Profile display component
│   │   └── ProfileEditForm.tsx # Profile editing form
│   ├── resources/
│   │   ├── ResourceUploadForm.tsx  # Upload form
│   │   ├── ResourceEditForm.tsx    # Edit form
│   │   ├── ResourceList.tsx        # Resource cards list
│   │   ├── ResourceFilters.tsx     # Advanced filter sidebar
│   │   ├── ResourceActions.tsx     # Edit/Delete actions
│   │   └── RatingStars.tsx         # Star rating component
│   ├── ui/
│   │   └── ThemeToggle.tsx     # Dark mode toggle button
│   └── providers/
│       ├── AuthProvider.tsx    # Authentication context provider
│       └── ThemeProvider.tsx   # Theme context provider
├── lib/
│   ├── actions/
│   │   ├── auth.ts             # Authentication actions
│   │   └── resources.ts        # Resource management actions
│   ├── hooks/
│   │   └── useAuth.ts          # Authentication hook
│   ├── supabase/
│   │   ├── client.ts           # Supabase client for browser
│   │   ├── server.ts           # Supabase client for server
│   │   └── middleware.ts       # Supabase middleware utilities
│   └── types/
│       └── database.types.ts   # TypeScript database types
├── proxy.ts                    # Next.js 16 proxy for session refresh
├── DATABASE_SETUP.md           # Task 1 database setup
├── DATABASE_SETUP_TASK2.md     # Task 2 database setup
├── DATABASE_SETUP_TASK3.md     # Task 3 database setup
├── DATABASE_SETUP_TASK4.md     # Task 4 database setup
└── .env.local                  # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun installed
- A Supabase account and project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd caspr
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Supabase

#### A. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run SQL from `DATABASE_SETUP.md` (Task 1: Authentication)
4. Run SQL from `DATABASE_SETUP_TASK2.md` (Task 2: Resources)
5. Run SQL from `DATABASE_SETUP_TASK3.md` (Task 3: Privacy & Access Control)
6. Run SQL from `DATABASE_SETUP_TASK4.md` (Task 4: Ratings & Indexes)

#### B. Storage Setup
1. Go to Storage in Supabase Dashboard
2. Create a bucket named `resource-files`
3. Make it **Public**
4. Add storage policies (see `DATABASE_SETUP_TASK2.md`)

### 4. Configure Environment Variables

Your `.env.local` file should already contain:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Quick Start Guides

- **Task 1 Setup**: See `QUICK_START.md` (Authentication & Profiles)
- **Task 2 Setup**: See `QUICK_START_TASK2.md` (Resources & Upload)
- **Task 3 Setup**: See `QUICK_START_TASK3.md` (Privacy & Dark Mode)
- **Task 4 Setup**: See `QUICK_START_TASK4.md` (Search, Filters & Ratings)

## What You Can Do Now

### All Users (Including Not Logged In)
- Browse all public resources
- View resource details
- Download files
- **Advanced Search**: Search by title, subject, description, or tags
- **Comprehensive Filters**: Filter by:
  - Resource type (Notes, Question Papers, etc.)
  - Semester (1-8)
  - Subject/Course
  - Branch/Department
  - Year/Batch
  - Privacy level (Public/Private)
- **Sort Options**: Sort by latest, highest rated, most popular, or most viewed
- View ratings and average scores
- Toggle between light and dark mode

### Logged In Users
- All of the above, plus:
- Create and manage your profile
- Upload academic resources (PDF, DOCX, PPT, images, etc.)
- **Choose privacy level**: Mark resources as Public or Private (college-only)
- Add searchable tags to your resources
- Edit your uploaded resources (including privacy settings)
- Delete your resources
- **Rate resources**: Give 1-5 star ratings to other users' resources
- Update your ratings anytime
- Track views and downloads of your uploads
- Access private resources from your own college

## Database Setup

See the following guides for database setup:
- `DATABASE_SETUP.md` - Task 1: User authentication and profiles
- `DATABASE_SETUP_TASK2.md` - Task 2: Resources, tags, and storage
- `DATABASE_SETUP_TASK3.md` - Task 3: Privacy settings and access control
- `DATABASE_SETUP_TASK4.md` - Task 4: Rating system and search indexes

## Usage

### Register a New Account

1. Visit `/register`
2. Fill in all required fields:
   - Email
   - Password
   - Full Name
   - College/Institution
   - Branch/Department
   - Current Year
   - Current Semester
3. Submit to create your account

### Login

1. Visit `/login`
2. Enter your email and password
3. You'll be redirected to your profile page

### View Profile

- After logging in, you'll see your profile with all your information
- Profile displays your name, email, college, branch, semester, year, and optional bio

### Edit Profile

1. Click "Edit Profile" on your profile page
2. Update any information (except email)
3. Save changes to update your profile

### Logout

- Click the "Logout" button on your profile page

## Authentication Flow

1. **Registration**: User signs up → Supabase creates auth user → Profile record is created
2. **Login**: User logs in → Supabase validates credentials → Session is created
3. **Session Management**: Middleware refreshes the auth token on every request
4. **Protected Routes**: Profile pages check authentication and redirect to login if not authenticated

## Key Features

### Server-Side Authentication

- Uses Next.js Server Actions for secure authentication
- Server Components for initial page loads
- Automatic session refresh via middleware

### Client-Side State

- `AuthProvider` context for client components
- `useAuth` hook for accessing user data
- Real-time auth state updates

### Row Level Security (RLS)

- Profiles are readable by all users (for future resource sharing features)
- Users can only insert/update their own profile
- Implemented at the database level in Supabase

## Completed Features

✅ **Task 1**: User authentication and profile management  
✅ **Task 2**: Resource upload, editing, and management  
✅ **Task 3**: Privacy settings and dark mode theme  
✅ **Task 4**: Advanced search, filters, sorting, and rating system  

## Potential Future Enhancements

- User statistics dashboard
- Recognition points and badges
- Resource collections/playlists
- Comments and discussions on resources
- Notification system
- Advanced analytics
- Mobile app

## Development

### Code Organization

- **Server Components**: Used for pages that fetch data server-side
- **Client Components**: Used for interactive UI (forms, auth context)
- **Server Actions**: Used for mutations (login, register, profile updates)
- **Middleware**: Handles session refresh for all routes

### Type Safety

- Full TypeScript support
- Database types defined in `lib/types/database.types.ts`
- Type-safe Supabase queries

## Troubleshooting

### "User not authenticated" errors

- Make sure you've set up the database schema correctly
- Check that RLS policies are in place
- Verify your Supabase credentials in `.env.local`

### Session not persisting

- Check that middleware is running (should be automatic)
- Clear browser cookies and try again
- Verify Supabase URL and keys are correct

### Profile not creating after registration

- Check Supabase logs for errors
- Verify the profiles table exists and has correct schema
- Ensure RLS policies allow inserts

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
