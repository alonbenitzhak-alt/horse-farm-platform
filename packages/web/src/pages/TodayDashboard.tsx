import { useState, useEffect, useRef } from 'react';
import type { TaskWithDetails, EventWithAttendees } from '@stableos/shared';
import { getTodayDashboard, completeTask, subscribeToTasks, subscribeToEvents } from '@stableos/shared';
import { formatTime, getEventTypeEmoji } from '@stableos/shared';
import { useTranslation } from '../hooks/useTranslation';

interface TodayDashboardProps {
  farmId: string;
  currentUserId?: string;
}

export default function TodayDashboard({ farmId, currentUserId }: TodayDashboardProps) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [events, setEvents] = useState<EventWithAttendees[]>([]);
  const [completionCount, setCompletionCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionsRef = useRef<any[]>([]);

  useEffect(() => {
    loadTodayData();

    try {
      const taskSub = subscribeToTasks(farmId, (updatedTasks) => {
        setTasks(updatedTasks);
        const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
        setCompletionCount(completedCount);
        setTotalCount(updatedTasks.length);
      });

      const eventSub = subscribeToEvents(farmId, setEvents);

      subscriptionsRef.current = [taskSub, eventSub];
    } catch (err) {
      console.warn('Real-time subscriptions unavailable:', err);
    }

    return () => {
      subscriptionsRef.current.forEach(sub => sub?.unsubscribe?.());
    };
  }, [farmId]);

  async function loadTodayData() {
    try {
      setLoading(true);
      setError(null);
      const dashboard = await getTodayDashboard(farmId);
      setTasks(dashboard.tasks || []);
      setEvents(dashboard.events || []);
      setCompletionCount(dashboard.completion_count || 0);
      setTotalCount(dashboard.total_count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('todayDashboard.failedToLoad'));
      console.error('Error loading today dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteTask(taskId: string) {
    try {
      if (!currentUserId) {
        alert(t('todayDashboard.userIdRequired'));
        return;
      }

      // Optimistic update
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, status: 'completed' } : t
        )
      );
      setCompletionCount(prev => prev + 1);

      // API call
      await completeTask(taskId, currentUserId);
    } catch (err) {
      console.error('Error completing task:', err);
      // Reload on error
      loadTodayData();
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const incompleteTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="today-dashboard">
      {/* Header */}
      <div className="today-header">
        <div className="today-date">{today}</div>
        <div className="today-progress">
          <div className="progress-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="progress-background" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-fill"
                style={{
                  strokeDasharray: `${(completionCount / Math.max(totalCount, 1)) * 283} 283`,
                }}
              />
            </svg>
            <div className="progress-text">
              <div className="progress-number">{completionCount}</div>
              <div className="progress-total">of {totalCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadTodayData} className="retry-button">
            {t('todayDashboard.retry')}
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && <div className="loading">{t('todayDashboard.loading')}</div>}

      {/* Tasks section */}
      {!loading && (
        <>
          {/* Incomplete tasks */}
          {incompleteTasks.length > 0 && (
            <div className="tasks-section">
              <h3 className="section-title">{t('todayDashboard.incompleteTasks')}</h3>
              <div className="tasks-list">
                {incompleteTasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-content">
                      <div className="task-main">
                        <div className="task-title">{task.title}</div>
                        {task.description && (
                          <div className="task-description">{task.description}</div>
                        )}
                      </div>
                      <div className="task-details">
                        {task.scheduled_time && (
                          <div className="task-time">🕐 {formatTime(task.scheduled_time)}</div>
                        )}
                        {task.assigned_person && (
                          <div className="task-assigned">
                            👤 {task.assigned_person.name}
                          </div>
                        )}
                        {task.horses && task.horses.length > 0 && (
                          <div className="task-horses">
                            🐎 {task.horses.map((h: any) => h.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="complete-button"
                      onClick={() => handleCompleteTask(task.id)}
                      title="Mark as complete"
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No tasks message */}
          {incompleteTasks.length === 0 && completedTasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <div className="empty-text">{t('todayDashboard.noTasks')}</div>
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div className="tasks-section completed-section">
              <h3 className="section-title">{t('todayDashboard.completedTasks')}</h3>
              <div className="tasks-list">
                {completedTasks.map(task => (
                  <div key={task.id} className="task-card completed">
                    <div className="task-content">
                      <div className="task-main">
                        <div className="task-title">{task.title}</div>
                        {task.notes && <div className="task-notes">📝 {task.notes}</div>}
                      </div>
                    </div>
                    <div className="completed-icon">✓</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events section */}
          {events.length > 0 && (
            <div className="events-section">
              <h3 className="section-title">{t('todayDashboard.events')}</h3>
              <div className="events-list">
                {events.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-emoji">{getEventTypeEmoji(event.event_type)}</div>
                    <div className="event-content">
                      <div className="event-title">{event.title}</div>
                      {event.time && (
                        <div className="event-time">🕐 {formatTime(event.time)}</div>
                      )}
                      {event.description && (
                        <div className="event-description">{event.description}</div>
                      )}
                      {event.location && (
                        <div className="event-location">📍 {event.location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadTodayData} className="refresh-button">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
