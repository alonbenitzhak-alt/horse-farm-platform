/**
 * Recurring task automation utilities
 * Generates task instances from templates based on frequency
 */

import type { TaskFrequency } from './types';

export function getNextOccurrence(date: Date, frequency: TaskFrequency): Date {
  const next = new Date(date);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'bi_weekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}

export function getFrequencyLabel(frequency: TaskFrequency, lang: 'en' | 'he' = 'en'): string {
  const labels = {
    en: {
      daily: 'Every day',
      weekly: 'Every week',
      bi_weekly: 'Every 2 weeks',
      monthly: 'Every month',
    },
    he: {
      daily: 'כל יום',
      weekly: 'כל שבוע',
      bi_weekly: 'כל שבועיים',
      monthly: 'כל חודש',
    },
  };

  return labels[lang][frequency];
}

export function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateFromDB(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function generateRecurringTasks(
  templateId: string,
  frequency: TaskFrequency,
  startDate: Date,
  endDate: Date,
  title: string,
  farmId: string,
  assignedTo?: string,
  description?: string
): Array<{ scheduled_date: string; scheduled_time?: string; title: string; description?: string; farm_id: string; template_id: string; assigned_to?: string; status: 'pending' }> {
  const tasks = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    tasks.push({
      scheduled_date: formatDateForDB(currentDate),
      title,
      description,
      farm_id: farmId,
      template_id: templateId,
      assigned_to: assignedTo,
      status: 'pending' as const,
    });

    currentDate = getNextOccurrence(currentDate, frequency);
  }

  return tasks;
}
