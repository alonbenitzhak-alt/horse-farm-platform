# 🐴 StableOS

Mobile-first Horse Farm Operations Platform

## What is StableOS?

StableOS answers the core question: **"What needs to happen at the farm today, who is responsible for it, when does it need to happen, and has it been completed?"**

The platform brings clarity to farm operations through:
- **Today Dashboard** - Central hub showing all tasks and events for the day
- **Calendar** - Plan ahead with recurring tasks and appointments
- **Task Management** - Create, assign, and track completion
- **Rosters** - Manage horses, people, and their roles
- **Real-time Updates** - Multi-user sync across mobile and web

## Tech Stack

- **Frontend:** React Native (Expo) + Next.js (Web)
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Language:** TypeScript
- **Monorepo:** pnpm workspaces

## Project Structure

```
horse-farm-platform/
├── packages/
│   ├── mobile/          (React Native + Expo)
│   ├── web/             (Next.js)
│   └── shared/          (TypeScript types, API client, hooks)
├── supabase/            (Database migrations & Edge Functions)
└── docs/                (Architecture & setup guides)
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase CLI (for local development)

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Initialize Supabase:
```bash
pnpm run setup:supabase
```

4. Run development servers:
```bash
# Terminal 1: Mobile
pnpm run dev:mobile

# Terminal 2: Web
pnpm run dev:web
```

## Development

### Shared Code
All shared logic lives in `packages/shared/`:
- TypeScript types
- Supabase API client
- Custom React hooks
- Utility functions

Update shared code → both mobile and web get the changes automatically.

### Mobile (Expo)
```bash
cd packages/mobile
pnpm dev
```

### Web (Next.js)
```bash
cd packages/web
pnpm dev
```

## Database

PostgreSQL schema in `supabase/migrations/`.

Run migrations:
```bash
pnpm run migrate
```

## Building

```bash
pnpm run build:mobile
pnpm run build:web
```

## Documentation

- [Architecture](./docs/architecture.md)
- [Database Schema](./docs/database.md)
- [Setup Guide](./docs/setup.md)
- [API Reference](./docs/api.md)

## Current Phase

🚀 **Phase 0: Infrastructure Setup**
- Database schema initialized
- Project structure created
- Auth configured
- Ready for Phase 1 development

## License

Proprietary - Family farm project
