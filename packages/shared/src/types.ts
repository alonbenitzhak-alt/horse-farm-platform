/**
 * Core TypeScript types for StableOS
 * Shared across mobile and web applications
 */

// Auth & User Management
export type UserRole = 'owner' | 'staff' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  farm_id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Farm
export interface Farm {
  id: string;
  name: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// People (flexible roles)
export type PersonRole = 'owner' | 'staff' | 'instructor' | 'vet' | 'farrier' | 'other';

export interface Person {
  id: string;
  farm_id: string;
  name: string;
  role: PersonRole;
  phone?: string;
  email?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Horse
export interface Horse {
  id: string;
  farm_id: string;
  name: string;
  breed?: string;
  color?: string;
  age?: number;
  owner_id?: string;
  photo_url?: string;
  gender?: 'male' | 'female';
  height?: string; // e.g., "15.2 hh"
  weight?: number; // in kg
  microchip_id?: string;
  registration_number?: string;
  temperament?: string;
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
  diet_requirements?: string;
  training_level?: 'beginner' | 'intermediate' | 'advanced';
  emergency_contact?: string;
  emergency_phone?: string;
  vet_name?: string;
  vet_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Horse with owner details (for display)
export interface HorseWithOwner extends Horse {
  owner?: Person;
}

// Task Template (recurring)
export type TaskFrequency = 'daily' | 'weekly' | 'bi_weekly' | 'monthly';

export interface TaskTemplate {
  id: string;
  farm_id: string;
  title: string;
  description?: string;
  frequency: TaskFrequency;
  recurrence_config?: Record<string, any>;
  assigned_to?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Task Status
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Task (instance)
export interface Task {
  id: string;
  farm_id: string;
  title: string;
  description?: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time?: string; // HH:MM
  template_id?: string;
  assigned_to?: string;
  status: TaskStatus;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Task with related data (for display)
export interface TaskWithDetails extends Task {
  horses?: Horse[];
  assigned_person?: Person;
  completed_person?: Person;
}

// Task-Horse relationship
export interface TaskHorse {
  task_id: string;
  horse_id: string;
}

// Event Types
export type EventType =
  | 'vet'
  | 'farrier'
  | 'lesson'
  | 'camp'
  | 'transport'
  | 'competition'
  | 'maintenance'
  | 'meeting'
  | 'other';

// Event
export interface Event {
  id: string;
  farm_id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  event_type?: EventType;
  attendees_json?: string; // JSON array of person IDs
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Event with attendees (for display)
export interface EventWithAttendees extends Event {
  attendees?: Person[];
}

// Activity Log
export type ActivityAction = 'created' | 'updated' | 'completed' | 'deleted';
export type ActivityEntityType = 'task' | 'event' | 'horse' | 'person' | 'template';

export interface Activity {
  id: string;
  farm_id: string;
  entity_type: ActivityEntityType;
  entity_id?: string;
  action: ActivityAction;
  user_id?: string;
  description?: string;
  created_at: string;
}

// Activity with user details (for display)
export interface ActivityWithUser extends Activity {
  user?: Person;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
  };
}

// Dashboard data
export interface TodayDashboard {
  date: string;
  tasks: TaskWithDetails[];
  events: EventWithAttendees[];
  completion_count: number;
  total_count: number;
}

// Calendar data
export interface CalendarDay {
  date: string;
  tasks: Task[];
  events: Event[];
}

// Horse Health Record Types
export type HealthRecordType = 'feeding' | 'vaccination' | 'farrier' | 'health_issue' | 'vital_signs' | 'exercise';

export interface HorseHealthRecord {
  id: string;
  horse_id: string;
  farm_id: string;
  record_type: HealthRecordType;
  title: string;
  description?: string;
  recorded_date: string; // YYYY-MM-DD
  recorded_time?: string; // HH:MM
  next_due_date?: string; // For recurring items like farrier (every 6-8 weeks), vaccinations (annual)
  notes?: string;
  created_at: string;
  updated_at: string;
}
