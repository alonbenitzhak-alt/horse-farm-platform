/**
 * Supabase API client for StableOS
 * Handles all database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Farm,
  Person,
  Horse,
  Task,
  TaskTemplate,
  Event,
  Activity,
  TaskWithDetails,
  EventWithAttendees,
  ActivityWithUser,
  TodayDashboard,
  HorseHealthRecord,
} from './types';

let supabaseClient: SupabaseClient | null = null;

export function initializeSupabase(url: string, key: string): SupabaseClient {
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  return supabaseClient;
}

// ============================================================================
// Farm Operations
// ============================================================================

export async function getFarm(farmId: string): Promise<Farm | null> {
  const { data, error } = await getSupabaseClient()
    .from('farms')
    .select('*')
    .eq('id', farmId)
    .single();

  if (error) throw error;
  return data;
}

export async function createFarm(farm: Partial<Farm>): Promise<Farm> {
  const { data, error } = await getSupabaseClient()
    .from('farms')
    .insert([farm])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// People Operations
// ============================================================================

export async function getPeople(farmId: string): Promise<Person[]> {
  const { data, error } = await getSupabaseClient()
    .from('people')
    .select('*')
    .eq('farm_id', farmId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getPerson(personId: string): Promise<Person | null> {
  const { data, error } = await getSupabaseClient()
    .from('people')
    .select('*')
    .eq('id', personId)
    .single();

  if (error) throw error;
  return data;
}

export async function createPerson(person: Partial<Person>): Promise<Person> {
  const { data, error } = await getSupabaseClient()
    .from('people')
    .insert([person])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePerson(personId: string, updates: Partial<Person>): Promise<Person> {
  const { data, error } = await getSupabaseClient()
    .from('people')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', personId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePerson(personId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('people')
    .delete()
    .eq('id', personId);

  if (error) throw error;
}

// ============================================================================
// Horse Operations
// ============================================================================

export async function getHorses(farmId: string): Promise<HorseWithDetails[]> {
  const { data, error } = await getSupabaseClient()
    .from('horses')
    .select('*, owner:people(*)')
    .eq('farm_id', farmId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getHorse(horseId: string): Promise<HorseWithDetails | null> {
  const { data, error } = await getSupabaseClient()
    .from('horses')
    .select('*, owner:people(*)')
    .eq('id', horseId)
    .single();

  if (error) throw error;
  return data;
}

export async function createHorse(horse: Partial<Horse>): Promise<Horse> {
  const { data, error } = await getSupabaseClient()
    .from('horses')
    .insert([horse])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHorse(horseId: string, updates: Partial<Horse>): Promise<Horse> {
  const { data, error } = await getSupabaseClient()
    .from('horses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', horseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHorse(horseId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('horses')
    .delete()
    .eq('id', horseId);

  if (error) throw error;
}

// ============================================================================
// Horse Health Records Operations
// ============================================================================

export async function getHorseHealthRecords(
  horseId: string,
  filters?: {
    recordType?: string;
    dateStart?: string;
    dateEnd?: string;
  }
): Promise<HorseHealthRecord[]> {
  let query = getSupabaseClient()
    .from('horse_health_records')
    .select('*')
    .eq('horse_id', horseId);

  if (filters?.recordType) {
    query = query.eq('record_type', filters.recordType);
  }
  if (filters?.dateStart) {
    query = query.gte('recorded_date', filters.dateStart);
  }
  if (filters?.dateEnd) {
    query = query.lte('recorded_date', filters.dateEnd);
  }

  const { data, error } = await query.order('recorded_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getHorseHealthRecord(recordId: string): Promise<HorseHealthRecord | null> {
  const { data, error } = await getSupabaseClient()
    .from('horse_health_records')
    .select('*')
    .eq('id', recordId)
    .single();

  if (error) throw error;
  return data;
}

export async function createHorseHealthRecord(record: Partial<HorseHealthRecord>): Promise<HorseHealthRecord> {
  const { data, error } = await getSupabaseClient()
    .from('horse_health_records')
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHorseHealthRecord(recordId: string, updates: Partial<HorseHealthRecord>): Promise<HorseHealthRecord> {
  const { data, error } = await getSupabaseClient()
    .from('horse_health_records')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', recordId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHorseHealthRecord(recordId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('horse_health_records')
    .delete()
    .eq('id', recordId);

  if (error) throw error;
}

// ============================================================================
// Task Operations
// ============================================================================

export async function getTasks(
  farmId: string,
  filters?: {
    status?: string;
    assignedTo?: string;
    horseName?: string;
    dateStart?: string;
    dateEnd?: string;
  }
): Promise<TaskWithDetails[]> {
  let query = getSupabaseClient()
    .from('tasks')
    .select('*, horses:task_horses(horse:horses(*)), assigned_person:people!assigned_to(*), completed_person:people!completed_by(*)')
    .eq('farm_id', farmId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }
  if (filters?.dateStart) {
    query = query.gte('scheduled_date', filters.dateStart);
  }
  if (filters?.dateEnd) {
    query = query.lte('scheduled_date', filters.dateEnd);
  }

  const { data, error } = await query.order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTasksForToday(farmId: string): Promise<TaskWithDetails[]> {
  const today = new Date().toISOString().split('T')[0];
  return getTasks(farmId, {
    dateStart: today,
    dateEnd: today,
  });
}

export async function getTask(taskId: string): Promise<TaskWithDetails | null> {
  const { data, error } = await getSupabaseClient()
    .from('tasks')
    .select('*, horses:task_horses(horse:horses(*)), assigned_person:people!assigned_to(*), completed_person:people!completed_by(*)')
    .eq('id', taskId)
    .single();

  if (error) throw error;
  return data;
}

export async function createTask(task: Partial<Task>, horseIds?: string[]): Promise<Task> {
  const { data, error } = await getSupabaseClient()
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;

  // Link horses if provided
  if (horseIds && horseIds.length > 0) {
    const taskHorses = horseIds.map((horseId) => ({
      task_id: data.id,
      horse_id: horseId,
    }));

    const { error: linkError } = await getSupabaseClient()
      .from('task_horses')
      .insert(taskHorses);

    if (linkError) throw linkError;
  }

  return data;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await getSupabaseClient()
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeTask(
  taskId: string,
  completedBy: string,
  notes?: string
): Promise<Task> {
  return updateTask(taskId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    completed_by: completedBy,
    notes: notes,
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

// ============================================================================
// Task Template Operations
// ============================================================================

export async function getTaskTemplates(farmId: string): Promise<TaskTemplate[]> {
  const { data, error } = await getSupabaseClient()
    .from('task_templates')
    .select('*')
    .eq('farm_id', farmId)
    .eq('is_active', true)
    .order('title');

  if (error) throw error;
  return data || [];
}

export async function createTaskTemplate(template: Partial<TaskTemplate>): Promise<TaskTemplate> {
  const { data, error } = await getSupabaseClient()
    .from('task_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// Event Operations
// ============================================================================

export async function getEvents(
  farmId: string,
  filters?: {
    dateStart?: string;
    dateEnd?: string;
  }
): Promise<EventWithAttendees[]> {
  let query = getSupabaseClient()
    .from('events')
    .select('*')
    .eq('farm_id', farmId);

  if (filters?.dateStart) {
    query = query.gte('date', filters.dateStart);
  }
  if (filters?.dateEnd) {
    query = query.lte('date', filters.dateEnd);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getEventsForToday(farmId: string): Promise<EventWithAttendees[]> {
  const today = new Date().toISOString().split('T')[0];
  return getEvents(farmId, {
    dateStart: today,
    dateEnd: today,
  });
}

export async function createEvent(event: Partial<Event>): Promise<Event> {
  const { data, error } = await getSupabaseClient()
    .from('events')
    .insert([event])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
  const { data, error } = await getSupabaseClient()
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// Activity Log Operations
// ============================================================================

export async function logActivity(activity: Partial<Activity>): Promise<Activity> {
  const { data, error } = await getSupabaseClient()
    .from('activities')
    .insert([activity])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActivities(farmId: string, limit: number = 50): Promise<ActivityWithUser[]> {
  const { data, error } = await getSupabaseClient()
    .from('activities')
    .select('*, user:people(*)')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ============================================================================
// Today Dashboard
// ============================================================================

export async function getTodayDashboard(farmId: string): Promise<TodayDashboard> {
  const today = new Date().toISOString().split('T')[0];

  const [tasks, events] = await Promise.all([
    getTasksForToday(farmId),
    getEventsForToday(farmId),
  ]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return {
    date: today,
    tasks,
    events,
    completion_count: completedCount,
    total_count: tasks.length,
  };
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

export function subscribeToTasks(
  farmId: string,
  callback: (tasks: TaskWithDetails[]) => void
): ReturnType<SupabaseClient['channel']> {
  return getSupabaseClient()
    .channel(`tasks:${farmId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `farm_id=eq.${farmId}`,
      },
      () => {
        getTasks(farmId).then(callback).catch(console.error);
      }
    )
    .subscribe();
}

export function subscribeToEvents(
  farmId: string,
  callback: (events: EventWithAttendees[]) => void
): ReturnType<SupabaseClient['channel']> {
  return getSupabaseClient()
    .channel(`events:${farmId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `farm_id=eq.${farmId}`,
      },
      () => {
        getEvents(farmId).then(callback).catch(console.error);
      }
    )
    .subscribe();
}

export function subscribeToPeople(
  farmId: string,
  callback: (people: Person[]) => void
): ReturnType<SupabaseClient['channel']> {
  return getSupabaseClient()
    .channel(`people:${farmId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'people',
        filter: `farm_id=eq.${farmId}`,
      },
      () => {
        getPeople(farmId).then(callback).catch(console.error);
      }
    )
    .subscribe();
}

export function subscribeToHorses(
  farmId: string,
  callback: (horses: HorseWithDetails[]) => void
): ReturnType<SupabaseClient['channel']> {
  return getSupabaseClient()
    .channel(`horses:${farmId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'horses',
        filter: `farm_id=eq.${farmId}`,
      },
      () => {
        getHorses(farmId).then(callback).catch(console.error);
      }
    )
    .subscribe();
}

// Type alias for convenience
export type HorseWithDetails = Horse & {
  owner?: Person;
};
