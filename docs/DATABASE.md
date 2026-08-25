# StableOS Database Schema

## Overview

PostgreSQL database hosted on Supabase. All tables include `farm_id` for multi-farm support in future versions.

## Core Tables

### farms
Root entity representing a farm.

```sql
CREATE TABLE farms (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Relationships:**
- Has many: people, horses, tasks, events, activities

---

### people
Farm team members with flexible roles.

```sql
CREATE TABLE people (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms(id),
  name TEXT NOT NULL,
  role TEXT ('owner' | 'staff' | 'instructor' | 'vet' | 'farrier' | 'other'),
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Relationships:**
- Belongs to: farm
- Has many: horses (as owner), tasks (assigned), tasks (completed), activities
- Participates in: events (attendees)

**Indexes:**
- `idx_people_farm_id` - Queries by farm

---

### horses
Farm horses with optional owner reference.

```sql
CREATE TABLE horses (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms(id),
  name TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  age INTEGER,
  owner_id UUID REFERENCES people(id),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Relationships:**
- Belongs to: farm, owner (person, optional)
- Participates in: task_horses (many-to-many with tasks)

**Indexes:**
- `idx_horses_farm_id` - Queries by farm
- `idx_horses_owner_id` - Queries by owner

---

### task_templates
Recurring task definitions. System auto-generates task instances.

```sql
CREATE TABLE task_templates (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms(id),
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT ('daily' | 'weekly' | 'bi_weekly' | 'monthly'),
  recurrence_config JSONB {
    "time": "HH:MM",
    "days_of_week": [0-6],
    "day_of_month": 1-31,
    "interval": 1+
  },
  assigned_to UUID REFERENCES people(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Relationships:**
- Belongs to: farm, assigned person (optional)
- Has many: tasks (instances)

**Indexes:**
- `idx_task_templates_farm_id` - Queries by farm

**Recurrence Examples:**

Daily at 7:00 AM:
```json
{ "time": "07:00", "days_of_week": [0,1,2,3,4,5,6] }
```

Weekly on Monday and Friday at 8:00 AM:
```json
{ "time": "08:00", "days_of_week": [1,5] }
```

Every other week on Tuesday at 9:00 AM:
```json
{ "time": "09:00", "days_of_week": [2], "interval": 2 }
```

---

### tasks
Individual task instances (one-time or generated from templates).

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL (YYYY-MM-DD),
  scheduled_time TIME (HH:MM),
  template_id UUID REFERENCES task_templates(id) OPTIONAL,
  assigned_to UUID REFERENCES people(id) OPTIONAL,
  status TEXT (
    'pending' | 'in_progress' | 'completed' | 'cancelled'
  ) DEFAULT 'pending',
  completed_at TIMESTAMPTZ OPTIONAL,
  completed_by UUID REFERENCES people(id) OPTIONAL,
  notes TEXT OPTIONAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Relationships:**
- Belongs to: farm, template (optional), assigned person (optional), completed person (optional)
- Participates in: task_horses (many-to-many with horses)

**Indexes:**
- `idx_tasks_farm_id` - Queries by farm
- `idx_tasks_farm_date` - Queries by farm and date (performance)
- `idx_tasks_status` - Queries by status
- `idx_tasks_assigned_to` - Queries by assigned person

**Task Status Flow:**
```
pending → in_progress → completed
pending → cancelled
```

---

### task_horses
Many-to-many relationship between tasks and horses.

```sql
CREATE TABLE task_horses (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  horse_id UUID REFERENCES horses(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, horse_id)
);
```

**Example Use Cases:**
- "Feed all horses" → linked to all horses
- "Prepare Luna and Rocky for lesson" → linked to 2 horses
- "Clean stall" → linked to 1 horse

**Indexes:**
- `idx_task_horses_horse_id` - Queries by horse

---

### events
One-time or recurring appointments (vet, farrier, lessons, competitions, maintenance, etc.)

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms(id),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL (YYYY-MM-DD),
  time TIME OPTIONAL (HH:MM),
  event_type TEXT (
    'vet' | 'farrier' | 'lesson' | 'camp' |
    'transport' | 'competition' | 'maintenance' | 'meeting' | 'other'
  ),
  attendees_json JSONB OPTIONAL (["person-id", "person-id"]),
  location TEXT OPTIONAL,
  notes TEXT OPTIONAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Relationships:**
- Belongs to: farm
- Participates in: people (attendees, stored as JSON)

**Indexes:**
- `idx_events_farm_id` - Queries by farm
- `idx_events_farm_date` - Queries by farm and date (performance)

---

### activities
Complete audit log for accountability and history.

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms(id),
  entity_type TEXT (
    'task' | 'event' | 'horse' | 'person' | 'template' | 'farm'
  ) NOT NULL,
  entity_id UUID OPTIONAL,
  action TEXT (
    'created' | 'updated' | 'completed' | 'deleted'
  ) NOT NULL,
  user_id UUID REFERENCES people(id) OPTIONAL,
  description TEXT OPTIONAL,
  created_at TIMESTAMPTZ
);
```

**Example Activities:**
- Task completed by John at 3:15 PM
- Luna (horse) added to farm
- Farrier appointment created for August 30
- Feed schedule template activated

**Indexes:**
- `idx_activities_farm_id` - Queries by farm
- `idx_activities_created_at` - Queries by recency

---

## Indexes Summary

High-performance indexes for common queries:

| Table | Index | Benefit |
|-------|-------|---------|
| people | farm_id | Filter team members by farm |
| horses | farm_id, owner_id | List horses, find by owner |
| task_templates | farm_id | List recurring tasks |
| tasks | farm_id + date | Today's dashboard query |
| tasks | status | Filter by pending/completed |
| tasks | assigned_to | User's assigned tasks |
| task_horses | horse_id | Horse's upcoming tasks |
| events | farm_id + date | Calendar queries |
| activities | farm_id, created_at | History/audit log |

---

## Row Level Security (RLS)

Basic RLS policies implemented for MVP (to be tightened in production):

- All authenticated users can read their farm's data
- Users can create tasks, complete tasks, add notes
- Only farm owners can delete entities

See database schema migration for current policies.

---

## Future Migrations

### Multi-Farm Support
Add junction table for users → farms:
```sql
CREATE TABLE user_farms (
  user_id TEXT,
  farm_id UUID REFERENCES farms(id),
  role TEXT ('admin' | 'member'),
  PRIMARY KEY (user_id, farm_id)
);
```

### Task Recurrence History
Track which template instance each task came from for better reporting and debugging.

### Permissions & Roles
Implement granular permissions per farm and per user (view-only, edit, admin).

### Reporting & Analytics
Add tables for trend data and historical analytics (task completion rates, etc.)
