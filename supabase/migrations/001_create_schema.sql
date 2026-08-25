-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Farms (root entity - single for MVP)
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- People (owners, staff, instructors, etc.)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Horses (with owner reference)
CREATE TABLE horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  age INTEGER,
  owner_id UUID REFERENCES people(id) ON DELETE SET NULL,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Templates (recurring task definitions)
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL,
  recurrence_config JSONB,
  assigned_to UUID REFERENCES people(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks (individual task instances)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES people(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES people(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task-Horse relationship (many-to-many)
CREATE TABLE task_horses (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, horse_id)
);

-- Events (appointments: vet, farrier, lessons, competitions, etc.)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  event_type TEXT,
  attendees_json JSONB,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log (audit trail)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  user_id UUID REFERENCES people(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_people_farm_id ON people(farm_id);
CREATE INDEX idx_horses_farm_id ON horses(farm_id);
CREATE INDEX idx_horses_owner_id ON horses(owner_id);
CREATE INDEX idx_task_templates_farm_id ON task_templates(farm_id);
CREATE INDEX idx_tasks_farm_id ON tasks(farm_id);
CREATE INDEX idx_tasks_farm_date ON tasks(farm_id, scheduled_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_task_horses_horse_id ON task_horses(horse_id);
CREATE INDEX idx_events_farm_id ON events(farm_id);
CREATE INDEX idx_events_farm_date ON events(farm_id, date);
CREATE INDEX idx_activities_farm_id ON activities(farm_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for MVP (allow all for now, tighten later)
CREATE POLICY "allow_read_own_farm" ON farms
  FOR SELECT USING (TRUE);

CREATE POLICY "allow_read_farm_people" ON people
  FOR SELECT USING (TRUE);

CREATE POLICY "allow_read_farm_horses" ON horses
  FOR SELECT USING (TRUE);

CREATE POLICY "allow_read_farm_tasks" ON tasks
  FOR SELECT USING (TRUE);

CREATE POLICY "allow_read_farm_events" ON events
  FOR SELECT USING (TRUE);

CREATE POLICY "allow_read_farm_activities" ON activities
  FOR SELECT USING (TRUE);
