# 🐴 StableOS

Mobile-first Horse Farm Operations Platform - Responsive PWA

## What is StableOS?

StableOS answers the core question: **"What needs to happen at the farm today, who is responsible for it, when does it need to happen, and has it been completed?"**

The platform brings clarity to farm operations through:
- **Today Dashboard** - Central hub showing all tasks and events for the day
- **Calendar** - Plan ahead with recurring tasks and appointments
- **Task Management** - Create, assign, and track completion
- **Rosters** - Manage horses, people, and their roles
- **Offline Support** - Works without internet (PWA with service workers)
- **Real-time Updates** - Multi-user sync across all devices

## Tech Stack

- **Frontend:** React + Vite (Responsive PWA)
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Language:** TypeScript
- **Package Manager:** pnpm workspaces

## Why PWA?

✅ **One Responsive Codebase** - Works on phone, tablet, and desktop  
✅ **No App Store Needed** - Install from browser, update automatically  
✅ **Offline Support** - Service workers handle offline access  
✅ **Fast MVP** - Single UI to build and maintain  
✅ **Simple for Non-Tech Users** - No app store confusion  

## Project Structure

```
horse-farm-platform/
├── packages/
│   ├── web/             (React + Vite responsive PWA)
│   └── shared/          (TypeScript types, API client, hooks)
├── supabase/            (Database migrations & Edge Functions)
└── docs/                (Architecture & setup guides)
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account ([create free account](https://supabase.com/))

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit with your Supabase credentials
```

3. Initialize Supabase:
```bash
# Local development:
supabase start

# Or use hosted Supabase and run migrations via SQL editor
```

## Running Locally

```bash
pnpm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

The app is a PWA - you can:
- Install it to your home screen (Chrome: menu → "Install app")
- Use it offline (cached pages + service worker)
- Works on all screen sizes (responsive design)

## Building for Production

```bash
pnpm run build
```

Outputs optimized PWA to `packages/web/dist/`

Deploy to:
- **Vercel** (recommended - one-click deploy from GitHub)
- **Netlify**
- **Any static hosting with HTTPS**

## Project Structure

### Shared Code (`packages/shared/`)
All shared TypeScript logic:
- **types.ts** - Data types for all entities
- **api.ts** - Supabase client and database operations
- **utils.ts** - Formatting, helpers, utilities
- **index.ts** - Main export

### Web App (`packages/web/`)
Responsive React PWA:
- **src/App.tsx** - Main app component with navigation
- **src/main.tsx** - Vite entry point
- **src/styles/** - Global CSS and component styles
- **public/manifest.json** - PWA manifest (installable app)
- **public/sw.js** - Service worker (offline support)
- **index.html** - HTML entry point

## Development

### Type Checking

```bash
pnpm run type-check
```

### File Structure
```
src/
├── App.tsx                 (Main component with 6 tabs)
├── App.css                 (App layout and responsive styles)
├── main.tsx                (Vite entry, service worker registration)
├── styles/
│   └── index.css           (Global CSS variables and reset)
└── pages/                  (Page components - to be built in Phase 1)
```

## Database

PostgreSQL schema in `supabase/migrations/001_create_schema.sql`

Core tables:
- farms, people, horses, task_templates, tasks, task_horses, events, activities

See `docs/DATABASE.md` for complete schema documentation.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Tech stack, structure, concepts
- [Database Schema](./docs/DATABASE.md) - All tables, relationships, indexes
- [Setup Guide](./docs/SETUP.md) - Installation and local development

## Current Phase

🚀 **Phase 0 Refactor: Architecture Updated to PWA**
- ✅ Removed Expo mobile app complexity
- ✅ Refactored to single responsive React + Vite
- ✅ Added PWA manifest (installable app)
- ✅ Added service worker (offline support)
- ✅ Bottom navigation bar (6 tabs)
- ⏳ Ready for Phase 1: MVP feature development

## Deployment

The PWA is ready to deploy to Vercel, Netlify, or any static hosting:

```bash
# Build
pnpm run build

# Test locally
pnpm run preview

# Deploy (push to GitHub, then deploy via Vercel dashboard)
```

## License

Proprietary - Family farm project
