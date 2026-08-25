import { useState, useEffect } from 'react';
import type { TaskWithDetails, EventWithAttendees } from '@stableos/shared';
import { getTasks, getEvents } from '@stableos/shared';
import { formatDate, getEventTypeEmoji } from '@stableos/shared';

interface CalendarProps {
  farmId: string;
}

export default function Calendar({ farmId }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [events, setEvents] = useState<EventWithAttendees[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    loadCalendarData();
  }, [farmId, currentDate, viewMode]);

  async function loadCalendarData() {
    try {
      setLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      let startDate: string;
      let endDate: string;

      if (viewMode === 'month') {
        startDate = new Date(year, month, 1).toISOString().split('T')[0];
        startDate = startDate.replace(/-/g, '-');
        endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      } else {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        startDate = weekStart.toISOString().split('T')[0];

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        endDate = weekEnd.toISOString().split('T')[0];
      }

      const [taskData, eventData] = await Promise.all([
        getTasks(farmId, { dateStart: startDate, dateEnd: endDate }),
        getEvents(farmId, { dateStart: startDate, dateEnd: endDate }),
      ]);

      setTasks(taskData || []);
      setEvents(eventData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
      console.error('Error loading calendar:', err);
    } finally {
      setLoading(false);
    }
  }

  function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getFirstDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  function getItemsForDate(dateStr: string): {
    tasks: TaskWithDetails[];
    events: EventWithAttendees[];
  } {
    return {
      tasks: tasks.filter(t => t.scheduled_date === dateStr),
      events: events.filter(e => e.date === dateStr),
    };
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  function previousWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  }

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="calendar">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-title">{monthName}</div>
        <div className="calendar-nav">
          <button
            className="nav-button-small"
            onClick={viewMode === 'month' ? previousMonth : previousWeek}
            title="Previous"
          >
            ←
          </button>
          <div className="view-toggle">
            <button
              className={`toggle-button ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              className={`toggle-button ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
          </div>
          <button
            className="nav-button-small"
            onClick={viewMode === 'month' ? nextMonth : nextWeek}
            title="Next"
          >
            →
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadCalendarData} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading calendar...</div>}

      {!loading && viewMode === 'month' && (
        <div className="calendar-month">
          {/* Day headers */}
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="calendar-grid">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="calendar-day empty" />;
              }

              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const { tasks: dayTasks, events: dayEvents } = getItemsForDate(dateStr);
              const isToday =
                dateStr ===
                new Date().toISOString().split('T')[0];

              return (
                <div
                  key={day}
                  className={`calendar-day ${isToday ? 'today' : ''}`}
                >
                  <div className="day-number">{day}</div>
                  <div className="day-items">
                    {dayEvents.map(event => (
                      <div key={event.id} className="calendar-item event">
                        <span className="item-emoji">
                          {getEventTypeEmoji(event.event_type)}
                        </span>
                        <span className="item-text">{event.title}</span>
                      </div>
                    ))}
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        className={`calendar-item task ${task.status === 'completed' ? 'completed' : ''}`}
                      >
                        <span className="item-status">
                          {task.status === 'completed' ? '✓' : '○'}
                        </span>
                        <span className="item-text">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && viewMode === 'week' && (
        <div className="calendar-week">
          <div className="week-view">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date(currentDate);
              date.setDate(currentDate.getDate() - currentDate.getDay() + i);
              const dateStr = date.toISOString().split('T')[0];
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();
              const { tasks: dayTasks, events: dayEvents } = getItemsForDate(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dateStr}
                  className={`week-day ${isToday ? 'today' : ''}`}
                >
                  <div className="week-day-header">
                    <div className="week-day-name">{dayName}</div>
                    <div className="week-day-num">{dayNum}</div>
                  </div>
                  <div className="week-day-items">
                    {dayEvents.map(event => (
                      <div key={event.id} className="calendar-item event">
                        <span className="item-emoji">
                          {getEventTypeEmoji(event.event_type)}
                        </span>
                        <span className="item-text">{event.title}</span>
                      </div>
                    ))}
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        className={`calendar-item task ${task.status === 'completed' ? 'completed' : ''}`}
                      >
                        <span className="item-status">
                          {task.status === 'completed' ? '✓' : '○'}
                        </span>
                        <span className="item-text">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadCalendarData} className="refresh-button">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
