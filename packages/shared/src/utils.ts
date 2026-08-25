/**
 * Utility functions for StableOS
 */

/**
 * Format a date string (YYYY-MM-DD) to readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format time string (HH:MM) to readable format
 */
export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const minute = minutes;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

/**
 * Check if a date is in the past
 */
export function isPast(dateStr: string): boolean {
  return dateStr < getTodayString();
}

/**
 * Check if a date is in the future
 */
export function isFuture(dateStr: string): boolean {
  return dateStr > getTodayString();
}

/**
 * Get date as Days from today (-1 = yesterday, 0 = today, 1 = tomorrow)
 */
export function getDaysFromToday(dateStr: string): number {
  const today = new Date(getTodayString() + 'T00:00:00');
  const date = new Date(dateStr + 'T00:00:00');
  const diff = date.getTime() - today.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get a friendly date label
 */
export function getFriendlyDateLabel(dateStr: string): string {
  const daysFromToday = getDaysFromToday(dateStr);

  if (daysFromToday === 0) return 'Today';
  if (daysFromToday === 1) return 'Tomorrow';
  if (daysFromToday === -1) return 'Yesterday';
  if (daysFromToday > 1 && daysFromToday <= 7) return `In ${daysFromToday} days`;
  if (daysFromToday < -1 && daysFromToday >= -7) return `${Math.abs(daysFromToday)} days ago`;

  return formatDate(dateStr);
}

/**
 * Parse recurrence config JSON
 */
export function parseRecurrenceConfig(config?: Record<string, any>): Record<string, any> {
  return config || {};
}

/**
 * Format task status for display
 */
export function formatTaskStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
}

/**
 * Get color for task status
 */
export function getTaskStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: '#e5e7eb',
    in_progress: '#fbbf24',
    completed: '#86efac',
    cancelled: '#d1d5db',
  };
  return colorMap[status] || '#e5e7eb';
}

/**
 * Get status icon
 */
export function getTaskStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    pending: '⚪',
    in_progress: '🟡',
    completed: '🟢',
    cancelled: '⭕',
  };
  return iconMap[status] || '⚪';
}

/**
 * Format person role for display
 */
export function formatPersonRole(role: string): string {
  const roleMap: Record<string, string> = {
    owner: 'Owner',
    staff: 'Staff',
    instructor: 'Instructor',
    vet: 'Veterinarian',
    farrier: 'Farrier',
    other: 'Other',
  };
  return roleMap[role] || role;
}

/**
 * Format event type for display
 */
export function formatEventType(type?: string): string {
  if (!type) return 'Event';
  const typeMap: Record<string, string> = {
    vet: 'Veterinary Visit',
    farrier: 'Farrier Visit',
    lesson: 'Riding Lesson',
    camp: 'Horse Camp',
    transport: 'Transportation',
    competition: 'Competition',
    maintenance: 'Facility Maintenance',
    meeting: 'Meeting',
    other: 'Event',
  };
  return typeMap[type] || type;
}

/**
 * Get emoji for event type
 */
export function getEventTypeEmoji(type?: string): string {
  const emojiMap: Record<string, string> = {
    vet: '⚕️',
    farrier: '🔨',
    lesson: '🎯',
    camp: '⛺',
    transport: '🚚',
    competition: '🏆',
    maintenance: '🔧',
    meeting: '👥',
    other: '📅',
  };
  return emojiMap[type || 'other'] || '📅';
}

/**
 * Sort tasks by date and time
 */
export function sortTasksByDateTime(tasks: any[]): any[] {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.scheduled_date + 'T' + (a.scheduled_time || '00:00'));
    const dateB = new Date(b.scheduled_date + 'T' + (b.scheduled_time || '00:00'));
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Group tasks by status
 */
export function groupTasksByStatus(tasks: any[]): Record<string, any[]> {
  return tasks.reduce(
    (groups, task) => {
      const status = task.status || 'pending';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(task);
      return groups;
    },
    {} as Record<string, any[]>
  );
}

/**
 * Group events by date
 */
export function groupEventsByDate(events: any[]): Record<string, any[]> {
  return events.reduce(
    (groups, event) => {
      const date = event.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    },
    {} as Record<string, any[]>
  );
}
