# StableOS Setup Guide

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- pnpm 8+ (`npm install -g pnpm`)
- Git
- Supabase account ([create free account](https://supabase.com/))

## Initial Setup

### 1. Install Dependencies

```bash
cd /path/to/horse-farm-platform
pnpm install
```

This installs dependencies for all packages (mobile, web, shared).

### 2. Set Up Supabase

#### Option A: Local Development (Supabase CLI)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to local development
supabase start
```

This starts a local PostgreSQL database and Supabase services on your machine.

#### Option B: Supabase Hosted

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Get your project URL and API key from Settings → API

### 3. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit with your Supabase credentials
# For local Supabase:
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For hosted Supabase:
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Database Migrations

#### Local Supabase:
```bash
supabase db push
```

#### Hosted Supabase:
```bash
# Use Supabase SQL Editor to run migrations from:
# supabase/migrations/001_create_schema.sql
```

## Running the Apps

### Mobile (React Native + Expo)

```bash
cd packages/mobile
pnpm dev
```

Opens Expo CLI. Options:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web
- Scan QR code with Expo Go app on real phone

### Web (Next.js)

```bash
cd packages/web
pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000)

### Both in Parallel

Terminal 1:
```bash
cd packages/mobile && pnpm dev
```

Terminal 2:
```bash
cd packages/web && pnpm dev
```

## Type Checking

```bash
pnpm run type-check
```

Checks TypeScript in all packages. Use before committing.

## Development Workflow

1. **Update Shared Code**
   ```bash
   # Edit packages/shared/src/*
   # Changes automatically reflected in mobile and web
   ```

2. **Mobile Development**
   ```bash
   cd packages/mobile
   # Edit src/screens/Today.tsx, etc.
   # Hot reload on save
   ```

3. **Web Development**
   ```bash
   cd packages/web
   # Edit app/page.tsx, etc.
   # Hot reload on save
   ```

## Testing Database

### Create Test Farm

```sql
INSERT INTO farms (id, name, location) VALUES (
  gen_random_uuid(),
  'Family Farm',
  'Upstate NY'
);
```

### Add Test People

```sql
INSERT INTO people (farm_id, name, role) VALUES (
  'YOUR_FARM_ID',
  'John Smith',
  'owner'
);
```

### Create Test Tasks

```sql
INSERT INTO tasks (
  farm_id, title, scheduled_date, status
) VALUES (
  'YOUR_FARM_ID',
  'Feed horses',
  CURRENT_DATE,
  'pending'
);
```

## Troubleshooting

### Port Already in Use

If port 3000 or others are in use:

```bash
# Web (change port)
cd packages/web
PORT=3001 pnpm dev

# Mobile (Expo will ask for port)
cd packages/mobile
pnpm dev  # Press ? for other options
```

### Supabase Connection Issues

```bash
# Check Supabase status
supabase status

# Restart services
supabase stop
supabase start
```

### Database Errors

Check that migrations have run:
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should show: farms, people, horses, tasks, task_templates, events, activities, etc.

## Next Steps

1. ✅ Dependencies installed
2. ✅ Supabase configured
3. ✅ Migrations run
4. ✅ Environment variables set
5. **Next:** Run mobile and web apps to verify setup
6. **Then:** Begin Phase 1 development

For architecture details, see `docs/ARCHITECTURE.md`
For database schema, see `docs/DATABASE.md`
