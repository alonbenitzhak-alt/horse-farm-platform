# StableOS Architecture

## Overview

StableOS is a responsive React PWA (Progressive Web App) built with:

- **Frontend:** React + Vite (responsive web app, installable as PWA)
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Language:** TypeScript
- **Package Manager:** pnpm workspaces

## Design Decision: Single Responsive PWA

**Why PWA instead of separate mobile + web apps?**

For a family farm MVP with non-technical users:
- ✅ **Single Codebase** - One UI, not two (faster development)
- ✅ **Responsive Design** - Automatically adapts to phone, tablet, desktop
- ✅ **User-Friendly** - Installs from browser, no app store confusion
- ✅ **Offline Support** - Service workers handle offline access
- ✅ **Faster MVP** - 3-5 days faster than managing separate codebases
- ✅ **Easy Maintenance** - Single source of truth for all features

See `docs/PWA_ARCHITECTURE_DECISION.md` for detailed analysis.

## Project Structure

```
horse-farm-platform/
├── packages/
│   ├── web/              React + Vite responsive PWA app
│   │   ├── src/
│   │   │   ├── App.tsx    (Main component, 6 tabs navigation)
│   │   │   ├── main.tsx   (Vite entry, service worker registration)
│   │   │   ├── styles/    (Global CSS, responsive design)
│   │   │   └── pages/     (Page components - to be built in Phase 1)
│   │   ├── public/        (PWA manifest, service worker, icons)
│   │   ├── index.html     (HTML entry point)
│   │   └── vite.config.ts (Build configuration)
│   │
│   └── shared/            Shared TypeScript logic
│       ├── src/
│       │   ├── types.ts   (All entity types)
│       │   ├── api.ts     (Supabase client, database operations)
│       │   ├── utils.ts   (Formatting, helpers)
│       │   └── index.ts   (Main export)
│
├── supabase/              Database configuration
│   ├── migrations/        (PostgreSQL schema files)
│   └── config.toml        (Supabase local config)
│
└── docs/                  Documentation
```

## Core Concepts

### Hero Screen: Today Dashboard
The primary user experience is the Today dashboard:
- What needs to happen today
- Who is responsible for each task
- When it needs to happen
- Whether it's been completed

This is the most important screen in the entire application.

### Responsive Design
- **Mobile** (320px-767px) - Bottom navigation bar, large touch targets
- **Tablet** (768px-1023px) - Optimized touch layout, larger elements
- **Desktop** (1024px+) - Right sidebar navigation, full-featured layout

All views use the same components and code - CSS media queries handle responsive behavior.

### Offline-First with Service Workers
Service worker (`public/sw.js`) handles:
- Caching static assets (HTML, CSS, JS)
- Network-first strategy for API calls
- Background sync for pending changes
- Automatic cache updates

Works completely offline - users can view cached data and queue changes for sync when online.

### Real-time Multi-User Sync
Supabase real-time subscriptions:
- When one user completes a task, all other users see it instantly
- Works across all connected devices
- WebSocket-based updates

## Database Design

### Single Farm MVP, Multi-Farm Ready
For MVP, StableOS operates as single-farm application. Database structured for expansion:
- All tables have `farm_id` field
- Future multi-farm: just add user→farm linking table
- No schema rewrites needed for expansion

### Core Entities

```
Farm (root)
├── People (roles: owner, staff, instructor, vet, farrier, etc.)
├── Horses (with optional owner reference)
├── Task Templates (recurring tasks)
│   └── Tasks (instances)
│       └── Task-Horse relationships (many-to-many)
├── Events (appointments: vet, farrier, lessons, etc.)
└── Activities (audit log)
```

See `docs/DATABASE.md` for complete schema and relationships.

## API Layer

Built on Supabase and provides:

1. **REST API** - Via Supabase auto-generated endpoints
2. **Real-time Subscriptions** - WebSocket updates across clients
3. **Authentication** - Email/magic link via Supabase Auth
4. **PostgreSQL Database** - With Row Level Security

### Key API Functions

From `packages/shared/src/api.ts`:

**Dashboard & Tasks:**
- `getTodayDashboard()` - Fetch today's tasks and events
- `getTasks()` - Query with filtering
- `getTasksForToday()` - Today's task list
- `completeTask()` - Mark complete with timestamp and notes

**Creation & Management:**
- `createTask()` - Create one-time task
- `createTaskTemplate()` - Create recurring task
- `createEvent()` - Create appointment
- `createPerson()` - Add team member
- `createHorse()` - Add horse

**Real-time:**
- `subscribeToTasks()` - Live task updates
- `subscribeToEvents()` - Live event updates

**Rosters:**
- `getHorses()` - All farm horses
- `getPeople()` - Team members
- `getActivities()` - Audit log

## Development Workflow

### Shared Code First
1. Update types in `packages/shared/src/types.ts`
2. Add API methods in `packages/shared/src/api.ts`
3. Add utilities in `packages/shared/src/utils.ts`
4. Both web and any future apps automatically get changes

### Web App Development
1. Create page components in `src/pages/`
2. Create reusable components in `src/components/`
3. Add styles in `src/styles/`
4. Import and use shared API client

### Type Safety
```bash
pnpm run type-check  # Check all packages
```

## Responsive CSS Strategy

**Mobile-First Approach:**
1. Build for phone first (320px and up)
2. Add media queries for larger screens

**CSS Variables:**
Defined in `src/styles/index.css`:
- Colors (light/dark theme support)
- Spacing (consistent sizing)
- Typography (font sizes, weights)
- Shadows and radius

Example responsive component:
```css
.nav-button {
  width: 100%;
  min-height: 48px;  /* Mobile touch target */
}

@media (min-width: 768px) {
  .nav-button {
    min-height: 70px;  /* Tablet */
  }
}
```

## PWA Features

### Installable
- `public/manifest.json` - App metadata (name, description, icons)
- Browser provides "Install" option
- Users add to home screen
- Appears as app, not browser tab

### Offline Support
- Service worker caches key pages
- Works without internet
- Queues changes for sync when online
- Automatic background sync

### Cross-Device
- Same URL on all devices
- Responsive CSS adapts UI
- Shared data via Supabase
- One version for everyone (no app store delays)

## Deployment

### Local Development
```bash
pnpm run dev
```
Opens on http://localhost:3000

### Production Build
```bash
pnpm run build
```
Outputs optimized PWA to `packages/web/dist/`

### Hosting Options
- **Vercel** (recommended) - One-click from GitHub
- **Netlify** - Drag-and-drop or GitHub integration
- **Any static host** - Must support HTTPS (required for PWA)

### Environment
PWA requires HTTPS in production (service workers require it). Development uses HTTP.

## Phase Timeline

### Phase 0: Infrastructure ✅
- Database schema created
- Supabase configured
- Shared types and API built
- Web PWA boilerplate

### Phase 1: MVP Core (5-6 days)
- Today Dashboard + Task Completion
- Calendar Screen
- Recurring Tasks
- Task Management
- Rosters (Horses, People)

### Phase 2: Polish (2-3 days)
- Settings screen
- Responsive refinement
- Dark mode
- Offline improvements

### Phase 3: Testing & Deploy (1-2 days)
- Real-world farm testing
- Bug fixes
- Deploy to production

## Key Design Principles

1. **Simplicity** - Every feature solves a core problem
2. **Mobile-First** - Design for phone, scale to desktop
3. **Touch-Optimized** - Large buttons (min 48px), swipe gestures
4. **Real-time** - Multi-user sync via subscriptions
5. **Offline-Ready** - Works without network
6. **Fast** - Quick load times, instant feedback
7. **Single Codebase** - One UI, one source of truth

## Future Expansion

### Without Code Changes
- Multi-farm support (add user→farm table)
- Role-based permissions (add to RLS policies)
- Analytics and reporting (add data tables)
- Advanced features (email, notifications, etc.)

### Optional Future: Native Apps
If PWA isn't sufficient, can build native apps reusing:
- Same API client (shared package)
- Same database schema
- Same business logic

But PWA is expected to be sufficient for MVP and beyond.
