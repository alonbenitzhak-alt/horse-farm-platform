# StableOS Architecture

## Overview

StableOS is a mobile-first Horse Farm Operations Platform built with:

- **Frontend:** React Native (Expo) + Next.js (Web)
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Language:** TypeScript

## Project Structure

```
horse-farm-platform/
├── packages/
│   ├── mobile/          React Native + Expo app
│   ├── web/             Next.js web application
│   └── shared/          Shared types, API client, utilities
├── supabase/            Database migrations & Edge Functions
└── docs/                Documentation
```

## Core Concepts

### Today Dashboard (Hero Screen)
The primary user experience is the Today dashboard. Users open the app and immediately see:
- What needs to happen today
- Who is responsible for each task
- What time it needs to happen
- Whether it's been completed

This is the most important screen in the entire application.

### Calendar
The calendar provides a month/week view showing all tasks and events scheduled for the farm, allowing users to plan ahead and understand the full schedule.

### Recurring Tasks
Daily, weekly, and monthly recurring tasks (feed horses, clean stalls, medications) are defined as task templates. The system auto-generates individual task instances for easy tracking.

### Events vs Tasks
- **Task:** Something someone needs to do (e.g., "Feed Luna")
- **Event:** Something that happens at a specific time (e.g., "Veterinarian arrives at 2:00 PM")

## Database Design

### Single Farm MVP, Multi-Farm Ready
For the MVP, StableOS operates as a single-farm application. However, the database is structured to support multi-farm expansion later:
- All tables have `farm_id` field
- Future multi-farm support requires only adding user-farm linking
- No schema rewrites needed for expansion

### Core Entities

```
Farm (root)
├── People (roles: owner, staff, instructor, vet, farrier, etc.)
├── Horses (with owner reference)
├── Task Templates (recurring)
│   └── Tasks (instances)
│       └── Task-Horse relationships (many-to-many)
├── Events (appointments: vet, farrier, lessons, etc.)
└── Activities (audit log)
```

### Schema Details

See `docs/DATABASE.md` for complete schema documentation.

## Development Workflow

### Shared Code
All shared logic lives in `packages/shared/`:
- TypeScript types (`types.ts`)
- Supabase API client (`api.ts`)
- Utility functions (`utils.ts`)

Update shared code and both mobile and web automatically get the changes.

### Mobile Development
```bash
cd packages/mobile
pnpm dev
```

### Web Development
```bash
cd packages/web
pnpm dev
```

### Type Safety
```bash
pnpm run type-check  # Check all packages
```

## API Layer

The API layer is built on Supabase and provides:

1. **REST API** - Via Supabase auto-generated endpoints
2. **Real-time Subscriptions** - WebSocket-based updates across all clients
3. **Authentication** - Email/magic link via Supabase Auth
4. **Database** - PostgreSQL with Row Level Security

### Key API Functions

See `packages/shared/src/api.ts` for implementation details:

- `getTodayDashboard()` - Fetch today's tasks and events
- `getTasks()` - Query all tasks with filtering
- `completeTask()` - Mark task as complete
- `createTask()` - Create new task
- `createTaskTemplate()` - Create recurring task
- `getEvents()` - Fetch events
- `createEvent()` - Create event
- `subscribeToTasks()` - Real-time task updates
- `subscribeToEvents()` - Real-time event updates

## Deployment

### Mobile
- **Development:** Expo Go app
- **Testing:** Internal testing via TestFlight (iOS) or Google Play internal testing (Android)
- **Production:** App Store and Google Play

### Web
- **Development:** Next.js dev server
- **Production:** Deployed to Vercel or similar

### Backend
- **Database:** Supabase hosted PostgreSQL
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime subscriptions

## Phase Timeline

### Phase 0: Infrastructure (1-2 days)
✅ Database schema created
✅ Supabase configured
✅ Project structure initialized
✅ Shared types and API client built

### Phase 1: MVP Core (5-6 days)
- Today Dashboard + Task Completion
- Calendar Screen
- Recurring Tasks
- Task Management
- Rosters (Horses, People)

### Phase 2: Polish (2-3 days)
- Settings screen
- Responsive design
- Dark mode
- Offline support

### Phase 3: Testing & Deploy (1-2 days)
- Real-world testing on farm
- Bug fixes and optimizations

## Key Design Principles

1. **Simplicity** - Every feature must solve a core problem
2. **Mobile-First** - Design for phone first, scale to web
3. **Touch-Optimized** - Large buttons, swipe gestures
4. **Real-time** - Multi-user sync via subscriptions
5. **Offline-Ready** - Works without network connection
6. **Fast** - Quick load times, instant feedback
