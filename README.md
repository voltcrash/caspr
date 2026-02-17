# CASPR - Campus Academic Resource Sharing Platform

A Next.js-based platform for students to share and access academic resources like past question papers, class notes, study materials, reference books, project reports, and assignment solutions.

## Features Implemented (Task 1)

### ✅ User Authentication & Profiles

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
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/
│   ├── profile/
│   │   ├── ProfileView.tsx     # Profile display component
│   │   └── ProfileEditForm.tsx # Profile editing form
│   └── providers/
│       └── AuthProvider.tsx    # Authentication context provider
├── lib/
│   ├── actions/
│   │   └── auth.ts             # Server actions for authentication
│   ├── hooks/
│   │   └── useAuth.ts          # Authentication hook for client components
│   ├── supabase/
│   │   ├── client.ts           # Supabase client for browser
│   │   ├── server.ts           # Supabase client for server
│   │   └── middleware.ts       # Supabase middleware utilities
│   └── types/
│       └── database.types.ts   # TypeScript database types
├── middleware.ts               # Next.js middleware for session refresh
├── DATABASE_SETUP.md           # Database setup instructions
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

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Follow the instructions in `DATABASE_SETUP.md` to create the necessary tables and policies

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

## Database Setup

See `DATABASE_SETUP.md` for detailed instructions on setting up the Supabase database schema.

### Quick Setup

Run this SQL in your Supabase SQL Editor:

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

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies (see DATABASE_SETUP.md for full policies)
```

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

## Next Steps (Future Tasks)

- Resource upload and management
- Search and filtering
- Rating system
- File storage integration
- Categories and tags
- User statistics and recognition points

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
