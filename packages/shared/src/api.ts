/**
 * Supabase API client for StableOS
 * Handles all database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthUser,
  UserProfile,
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
  Expense,
  ExpenseAnalytics,
  FarmAnalytics,
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
// Demo Data
// ============================================================================

export function getDemoHorses(): Horse[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'demo-horse-1',
      farm_id: 'demo-farm',
      name: 'סטאר - Star',
      breed: 'Thoroughbred',
      color: 'Bay',
      age: 5,
      gender: 'female',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-horse-2',
      farm_id: 'demo-farm',
      name: 'פרינס - Prince',
      breed: 'Arabian',
      color: 'Chestnut',
      age: 7,
      gender: 'male',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-horse-3',
      farm_id: 'demo-farm',
      name: 'לונה - Luna',
      breed: 'Quarter Horse',
      color: 'Gray',
      age: 4,
      gender: 'female',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ];
}

export function getDemoTasks(): Task[] {
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'demo-task-1',
      farm_id: 'demo-farm',
      title: 'האכלה בוקר',
      description: 'האכל את כל הסוסים בשעה 7:00 בבוקר',
      scheduled_date: today,
      scheduled_time: '07:00',
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-task-2',
      farm_id: 'demo-farm',
      title: 'ניקוי הסטבל',
      description: 'נקה את כל קומות הסטבל וחלף סחובה',
      scheduled_date: today,
      scheduled_time: '08:00',
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-task-3',
      farm_id: 'demo-farm',
      title: 'תרגול עם סטאר',
      description: 'תרגול רכיבה עם סטאר במגרש',
      scheduled_date: today,
      scheduled_time: '10:00',
      status: 'completed',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-task-4',
      farm_id: 'demo-farm',
      title: 'בדיקת בריאות',
      description: 'בדוק את בריאות כל הסוסים - טמפרטורה, דופק, נשימה',
      scheduled_date: tomorrow,
      scheduled_time: '09:00',
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-task-5',
      farm_id: 'demo-farm',
      title: 'טרימינג כפות',
      description: 'קצץ כפות לכל הסוסים',
      scheduled_date: nextWeek,
      scheduled_time: '14:00',
      status: 'pending',
      created_at: now,
      updated_at: now,
    },
  ];
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
  if (farmId === 'demo-farm') {
    return getDemoHorses() as HorseWithDetails[];
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from('horses')
      .select('*, owner:people(*)')
      .eq('farm_id', farmId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.warn('Failed to fetch horses:', error);
      return getDemoHorses() as HorseWithDetails[];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching horses:', err);
    return getDemoHorses() as HorseWithDetails[];
  }
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
  if (farmId === 'demo-farm') {
    let demoTasks = getDemoTasks();

    if (filters?.status) {
      demoTasks = demoTasks.filter(t => t.status === filters.status);
    }
    if (filters?.dateStart) {
      demoTasks = demoTasks.filter(t => t.scheduled_date >= filters.dateStart!);
    }
    if (filters?.dateEnd) {
      demoTasks = demoTasks.filter(t => t.scheduled_date <= filters.dateEnd!);
    }

    return demoTasks as TaskWithDetails[];
  }

  try {
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

    if (error) {
      console.warn('Failed to fetch tasks:', error);
      return getDemoTasks() as TaskWithDetails[];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching tasks:', err);
    return getDemoTasks() as TaskWithDetails[];
  }
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
// Event Operations
// ============================================================================

export async function getEvents(
  farmId: string,
  filters?: {
    dateStart?: string;
    dateEnd?: string;
  }
): Promise<EventWithAttendees[]> {
  if (farmId === 'demo-farm') {
    return [];
  }

  try {
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

    if (error) {
      console.warn('Failed to fetch events:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching events:', err);
    return [];
  }
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

// ============================================================================
// Authentication & User Management
// ============================================================================

function generateFarmCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `FARM-${timestamp}${random}`;
}

export async function createDemoData(farmId: string): Promise<void> {
  const client = getSupabaseClient();

  const demoHorses = [
    {
      farm_id: farmId,
      name: 'סטאר - Star',
      breed: 'Thoroughbred',
      color: 'Bay',
      age: 5,
      gender: 'female',
      is_active: true,
    },
    {
      farm_id: farmId,
      name: 'פרינס - Prince',
      breed: 'Arabian',
      color: 'Chestnut',
      age: 7,
      gender: 'male',
      is_active: true,
    },
    {
      farm_id: farmId,
      name: 'לונה - Luna',
      breed: 'Quarter Horse',
      color: 'Gray',
      age: 4,
      gender: 'female',
      is_active: true,
    },
  ];

  const { data: insertedHorses, error: horsesError } = await client
    .from('horses')
    .insert(demoHorses)
    .select();

  if (horsesError) {
    console.error('Failed to create demo horses:', horsesError);
    return;
  }

  if (!insertedHorses || insertedHorses.length === 0) return;

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const demoTasks = [
    {
      farm_id: farmId,
      title: 'האכלה בוקר',
      description: 'האכל את כל הסוסים בשעה 7:00 בבוקר',
      scheduled_date: today,
      scheduled_time: '07:00',
      status: 'pending',
    },
    {
      farm_id: farmId,
      title: 'ניקוי הסטבל',
      description: 'נקה את כל קומות הסטבל וחלף סחובה',
      scheduled_date: today,
      scheduled_time: '08:00',
      status: 'pending',
    },
    {
      farm_id: farmId,
      title: 'תרגול עם סטאר',
      description: 'תרגול רכיבה עם סטאר במגרש',
      scheduled_date: today,
      scheduled_time: '10:00',
      status: 'pending',
    },
    {
      farm_id: farmId,
      title: 'בדיקת בריאות',
      description: 'בדוק את בריאות כל הסוסים - טמפרטורה, דופק, נשימה',
      scheduled_date: tomorrow,
      scheduled_time: '09:00',
      status: 'pending',
    },
    {
      farm_id: farmId,
      title: 'טרימינג כפות',
      description: 'קצץ כפות לכל הסוסים',
      scheduled_date: nextWeek,
      scheduled_time: '14:00',
      status: 'pending',
    },
  ];

  const { data: insertedTasks, error: tasksError } = await client
    .from('tasks')
    .insert(demoTasks)
    .select();

  if (tasksError) {
    console.error('Failed to create demo tasks:', tasksError);
    return;
  }

  if (!insertedTasks || insertedTasks.length < 3) return;

  const taskHorseLinks = [
    { task_id: insertedTasks[0].id, horse_id: insertedHorses[0].id },
    { task_id: insertedTasks[0].id, horse_id: insertedHorses[1].id },
    { task_id: insertedTasks[0].id, horse_id: insertedHorses[2].id },
    { task_id: insertedTasks[1].id, horse_id: insertedHorses[0].id },
    { task_id: insertedTasks[1].id, horse_id: insertedHorses[1].id },
    { task_id: insertedTasks[1].id, horse_id: insertedHorses[2].id },
    { task_id: insertedTasks[2].id, horse_id: insertedHorses[0].id },
    { task_id: insertedTasks[3].id, horse_id: insertedHorses[0].id },
    { task_id: insertedTasks[3].id, horse_id: insertedHorses[1].id },
  ];

  const { error: linkError } = await client
    .from('task_horses')
    .insert(taskHorseLinks);

  if (linkError) {
    console.error('Failed to link demo tasks to horses:', linkError);
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  farmName: string
): Promise<{ user: AuthUser; farm: Farm }> {
  const client = getSupabaseClient();

  const { data: authData, error: authError } = await client.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  const farmCode = generateFarmCode();

  const { data: farm, error: farmError } = await client
    .from('farms')
    .insert([{ name: farmName, farm_code: farmCode }])
    .select()
    .single();

  if (farmError) throw farmError;

  const { error: profileError } = await client
    .from('user_profiles')
    .insert([
      {
        user_id: authData.user.id,
        farm_id: farm.id,
        name,
        email,
        role: 'owner',
        is_active: true,
      },
    ]);

  if (profileError) throw profileError;

  await createDemoData(farm.id).catch(err => {
    console.error('Failed to create demo data:', err);
  });

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
      created_at: authData.user.created_at,
    },
    farm,
  };
}

export async function joinFarmWithCode(
  email: string,
  password: string,
  name: string,
  farmCode: string,
  role: 'manager' | 'staff'
): Promise<{ user: AuthUser; farm: Farm }> {
  const client = getSupabaseClient();

  const { data: authData, error: authError } = await client.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  const { data: farms, error: farmError } = await client
    .from('farms')
    .select('*')
    .eq('farm_code', farmCode)
    .single();

  if (farmError) throw new Error('Farm code not found or invalid');
  if (!farms) throw new Error('Farm not found');

  const { error: profileError } = await client
    .from('user_profiles')
    .insert([
      {
        user_id: authData.user.id,
        farm_id: farms.id,
        name,
        email,
        role: role === 'manager' ? 'manager' : 'staff',
        is_active: true,
      },
    ]);

  if (profileError) throw profileError;

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
      created_at: authData.user.created_at,
    },
    farm: farms,
  };
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Failed to login');

  return {
    id: data.user.id,
    email: data.user.email!,
    created_at: data.user.created_at,
  };
}

export async function logoutUser(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data } = await getSupabaseClient().auth.getUser();
  if (!data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email!,
    created_at: data.user.created_at,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabaseClient()
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await getSupabaseClient()
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFarmUsers(farmId: string): Promise<UserProfile[]> {
  if (farmId === 'demo-farm') {
    return [];
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from('user_profiles')
      .select('*')
      .eq('farm_id', farmId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.warn('Failed to fetch farm users:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching farm users:', err);
    return [];
  }
}

// Type alias for convenience
export type HorseWithDetails = Horse & {
  owner?: Person;
};

// Task Template Functions
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

export async function getTaskTemplate(templateId: string): Promise<TaskTemplate> {
  const { data, error } = await getSupabaseClient()
    .from('task_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  return data;
}

export async function createTaskTemplate(template: Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<TaskTemplate> {
  const { data, error } = await getSupabaseClient()
    .from('task_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTaskTemplate(
  templateId: string,
  updates: Partial<Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at'>>
): Promise<TaskTemplate> {
  const { data, error } = await getSupabaseClient()
    .from('task_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTaskTemplate(templateId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('task_templates')
    .delete()
    .eq('id', templateId);

  if (error) throw error;
}

export async function generateRecurringTasksFromTemplate(
  templateId: string,
  startDate: string,
  endDate: string
): Promise<Task[]> {
  const template = await getTaskTemplate(templateId);

  const { generateRecurringTasks } = await import('./recurring');

  const tasksToCreate = generateRecurringTasks(
    templateId,
    template.frequency,
    new Date(startDate),
    new Date(endDate),
    template.title,
    template.farm_id,
    template.assigned_to,
    template.description
  );

  if (tasksToCreate.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseClient()
    .from('tasks')
    .insert(tasksToCreate)
    .select();

  if (error) throw error;
  return data || [];
}

// Expense Management
export async function getExpenses(farmId: string, filters?: { startDate?: string; endDate?: string; category?: string }): Promise<Expense[]> {
  let query = getSupabaseClient()
    .from('expenses')
    .select('*')
    .eq('farm_id', farmId);

  if (filters?.startDate) {
    query = query.gte('expense_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('expense_date', filters.endDate);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query.order('expense_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
  const { data, error } = await getSupabaseClient()
    .from('expenses')
    .insert([expense])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExpense(expenseId: string, updates: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>): Promise<Expense> {
  const { data, error } = await getSupabaseClient()
    .from('expenses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
}

// Analytics Functions
export async function getExpenseAnalytics(farmId: string, startDate?: string, endDate?: string): Promise<ExpenseAnalytics> {
  const expenses = await getExpenses(farmId, { startDate, endDate });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory: Record<string, number> = {};
  expenses.forEach(exp => {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
  });

  const byMonth: Record<string, number> = {};
  expenses.forEach(exp => {
    const month = exp.expense_date.substring(0, 7);
    byMonth[month] = (byMonth[month] || 0) + exp.amount;
  });

  const daysDiff = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  return {
    totalExpenses,
    byCategory,
    byMonth,
    averagePerDay: daysDiff > 0 ? totalExpenses / daysDiff : 0,
    largestExpense: expenses.length > 0 ? { amount: Math.max(...expenses.map(e => e.amount)), description: expenses.find(e => e.amount === Math.max(...expenses.map(x => x.amount)))?.description } : { amount: 0 },
    dateRange: { start: startDate || new Date().toISOString().split('T')[0], end: endDate || new Date().toISOString().split('T')[0] },
  };
}

export async function getFarmAnalytics(farmId: string): Promise<FarmAnalytics> {
  const [horses, people, tasks, healthRecords] = await Promise.all([
    getHorses(farmId),
    getFarmUsers(farmId),
    getTasks(farmId),
    getHorseHealthRecords(farmId),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const completedThisMonth = tasks.filter(t => {
    if (!t.completed_at) return false;
    const completed = new Date(t.completed_at);
    return completed >= monthStart && completed <= monthEnd;
  }).length;

  const completedRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0;

  return {
    totalHorses: horses?.length || 0,
    totalStaff: people?.length || 0,
    totalTasks: tasks?.length || 0,
    completedTasksThisMonth: completedThisMonth,
    averageTaskCompletionRate: Math.round(completedRate),
    totalHealthRecords: healthRecords?.length || 0,
    upcomingMaintenance: tasks?.filter(t => {
      const date = new Date(t.scheduled_date);
      return date >= now && date <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) && t.status !== 'completed';
    }).length || 0,
    dateRange: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
  };
}
