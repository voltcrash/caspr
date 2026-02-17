# CASPR File Structure

## Complete Project File Tree

```
caspr/
├── 📄 Documentation Files
│   ├── README.md                      # Main project documentation
│   ├── DATABASE_SETUP.md              # Database setup instructions
│   ├── QUICK_START.md                 # Quick start guide (START HERE!)
│   ├── TASK1_COMPLETE.md              # Task 1 completion details
│   ├── IMPLEMENTATION_SUMMARY.md      # Implementation summary
│   └── FILE_STRUCTURE.md              # This file
│
├── 📁 app/                            # Next.js App Router pages
│   ├── layout.tsx                     # Root layout with AuthProvider
│   ├── page.tsx                       # Landing page (redirects if logged in)
│   ├── globals.css                    # Global styles
│   │
│   ├── login/
│   │   └── page.tsx                   # Login page
│   │
│   ├── register/
│   │   └── page.tsx                   # Registration page
│   │
│   └── profile/
│       ├── page.tsx                   # Profile view (protected)
│       └── edit/
│           └── page.tsx               # Profile edit (protected)
│
├── 📁 components/                     # React components
│   ├── profile/
│   │   ├── ProfileView.tsx            # Profile display component
│   │   └── ProfileEditForm.tsx        # Profile editing form
│   │
│   └── providers/
│       └── AuthProvider.tsx           # Authentication context provider
│
├── 📁 lib/                            # Library code
│   ├── actions/
│   │   └── auth.ts                    # Server actions (signup, login, etc.)
│   │
│   ├── hooks/
│   │   └── useAuth.ts                 # Authentication hook
│   │
│   ├── supabase/
│   │   ├── client.ts                  # Supabase browser client
│   │   ├── server.ts                  # Supabase server client
│   │   └── middleware.ts              # Supabase middleware utilities
│   │
│   └── types/
│       └── database.types.ts          # TypeScript database types
│
├── 📁 public/                         # Static files
│   ├── next.svg
│   └── vercel.svg
│
├── middleware.ts                      # Next.js middleware (session management)
├── .env.local                         # Environment variables (Supabase config)
├── .env.example                       # Example environment file
├── .gitignore                         # Git ignore rules
├── package.json                       # Dependencies
├── bun.lock                           # Lockfile
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── postcss.config.mjs                 # PostCSS configuration
├── eslint.config.mjs                  # ESLint configuration
└── tailwind.config.ts (not created)   # Tailwind uses v4 CSS-based config
```

## File Count Summary

### TypeScript/React Files (16)
- Pages: 6 files
- Components: 3 files
- Server Actions: 1 file
- Supabase Config: 3 files
- Types: 1 file
- Hooks: 1 file
- Middleware: 1 file

### Documentation (5)
- README.md
- DATABASE_SETUP.md
- QUICK_START.md
- TASK1_COMPLETE.md
- IMPLEMENTATION_SUMMARY.md

### Configuration (6)
- package.json
- tsconfig.json
- next.config.ts
- postcss.config.mjs
- eslint.config.mjs
- .env.local

**Total: 27+ files created/modified**

## Key File Descriptions

### Pages

#### `app/page.tsx`
- Landing page with hero section
- Features overview
- Login/Register buttons
- Redirects to profile if already logged in

#### `app/login/page.tsx`
- Email/password login form
- Error handling
- Link to registration
- Client component

#### `app/register/page.tsx`
- Comprehensive registration form
- All required profile fields
- Validation
- Password confirmation
- Client component

#### `app/profile/page.tsx`
- Protected route (requires auth)
- Displays user profile
- Server component
- Passes data to ProfileView component

#### `app/profile/edit/page.tsx`
- Protected route (requires auth)
- Profile editing interface
- Server component
- Passes data to ProfileEditForm component

### Components

#### `components/profile/ProfileView.tsx`
- Displays profile information
- Profile picture or initial avatar
- Edit profile button
- Logout button
- Beautiful gradient design

#### `components/profile/ProfileEditForm.tsx`
- Form for editing profile
- Pre-filled with current data
- Validation
- Save/Cancel buttons
- Client component with state management

#### `components/providers/AuthProvider.tsx`
- React Context provider
- Manages authentication state
- Listens for auth changes
- Fetches user profile
- Wraps entire app in layout.tsx

### Server Logic

#### `lib/actions/auth.ts`
- `signup()` - Register new user
- `login()` - Authenticate user
- `logout()` - Sign out user
- `getUser()` - Get current user
- `getProfile()` - Get user profile
- `updateProfile()` - Update profile data

### Supabase Configuration

#### `lib/supabase/client.ts`
- Browser-side Supabase client
- For use in Client Components
- Handles cookie-based sessions

#### `lib/supabase/server.ts`
- Server-side Supabase client
- For use in Server Components and Actions
- Cookie management

#### `lib/supabase/middleware.ts`
- Utilities for middleware
- Session refresh logic
- Cookie handling

### Middleware

#### `middleware.ts`
- Runs on every request
- Refreshes authentication token
- Maintains session state
- Excludes static files

### Types

#### `lib/types/database.types.ts`
- TypeScript interfaces for database
- Profile type definitions
- Type-safe queries

### Hooks

#### `lib/hooks/useAuth.ts`
- Custom React hook
- Access authentication state in components
- Returns user, profile, and loading state

## Critical Files for Understanding

**Start with these 5 files to understand the system:**

1. `QUICK_START.md` - How to get started
2. `app/login/page.tsx` - See how login works
3. `lib/actions/auth.ts` - See server-side logic
4. `lib/supabase/server.ts` - See Supabase setup
5. `middleware.ts` - See session management

## Routes Available

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (require authentication)
- `/profile` - View profile
- `/profile/edit` - Edit profile

## Environment Variables

Located in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Configuration Files

- `tsconfig.json` - TypeScript compiler options
- `next.config.ts` - Next.js configuration
- `package.json` - Dependencies and scripts
- `eslint.config.mjs` - Linting rules
- `postcss.config.mjs` - PostCSS plugins (Tailwind)

## Next.js App Router Structure

This project uses Next.js 16 with the App Router:
- File-based routing
- Server Components by default
- Client Components marked with 'use client'
- Server Actions for mutations
- Middleware for auth
- Layouts for shared UI

## Database (Supabase)

**Table:** `profiles`
- Stores user profile information
- Linked to Supabase Auth users
- Row Level Security enabled

See `DATABASE_SETUP.md` for schema details.
