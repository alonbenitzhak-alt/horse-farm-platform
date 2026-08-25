import { useState, useEffect } from 'react';
import type { Horse, Person, TaskWithDetails } from '@stableos/shared';
import { getHorses, getPeople, getTasks } from '@stableos/shared';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/admin-dashboard.css';

interface AdminDashboardProps {
  farmId: string;
}

export default function AdminDashboard({ farmId }: AdminDashboardProps) {
  const { t } = useTranslation();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, [farmId]);

  async function loadAdminData() {
    try {
      setLoading(true);
      setError(null);
      const [horsesData, peopleData, tasksData] = await Promise.all([
        getHorses(farmId),
        getPeople(farmId),
        getTasks(farmId),
      ]);
      setHorses(horsesData || []);
      setPeople(peopleData || []);
      setTasks(tasksData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const activeHorses = horses.filter(h => h.is_active).length;
  const activeStaff = people.filter(p => p.is_active).length;
  const todayTasks = tasks.filter(t => t.scheduled_date === new Date().toISOString().split('T')[0]);
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed').length;

  const staffWorkload = people.map(person => ({
    ...person,
    assignedTasks: tasks.filter(t => t.assigned_to === person.id).length,
    completedTasks: tasks.filter(t => t.completed_by === person.id && t.status === 'completed').length,
  }));

  if (loading) {
    return <div className="admin-dashboard"><div className="loading">{t('dashboard.loading')}</div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>ניהול החוות</h2>
        <button onClick={loadAdminData} className="refresh-button">
          🔄 {t('dashboard.refresh')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadAdminData} className="retry-button">
            {t('dashboard.retry')}
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{activeHorses}</div>
          <div className="metric-label">סוסים פעילים</div>
          <div className="metric-detail">מתוך {horses.length} סה"כ</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{activeStaff}</div>
          <div className="metric-label">עובדים פעילים</div>
          <div className="metric-detail">מתוך {people.length} סה"כ</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{pendingTasks}</div>
          <div className="metric-label">משימות בהמתנה</div>
          <div className="metric-detail">{inProgressTasks} בתהליך</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{completedTodayTasks}/{todayTasks.length}</div>
          <div className="metric-label">משימות היום</div>
          <div className="metric-detail">{Math.round((completedTodayTasks / todayTasks.length || 0) * 100)}% בוצע</div>
        </div>
      </div>

      {/* Staff Management */}
      <div className="admin-section">
        <h3>עומס עבודה של הצוות</h3>
        <div className="staff-table">
          <div className="table-header">
            <div className="col-name">שם</div>
            <div className="col-role">תפקיד</div>
            <div className="col-tasks">משימות מוקצות</div>
            <div className="col-completed">הושלמו</div>
            <div className="col-status">סטטוס</div>
          </div>
          {staffWorkload.map(staff => (
            <div key={staff.id} className="table-row">
              <div className="col-name">
                <div className="staff-name">{staff.name}</div>
              </div>
              <div className="col-role">{staff.role}</div>
              <div className="col-tasks">{staff.assignedTasks}</div>
              <div className="col-completed">{staff.completedTasks}</div>
              <div className="col-status">
                <span className={`status-badge ${staff.is_active ? 'active' : 'inactive'}`}>
                  {staff.is_active ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Horse Health Overview */}
      <div className="admin-section">
        <h3>סקירת הסוסים</h3>
        <div className="horses-grid">
          {horses.map(horse => (
            <div key={horse.id} className={`horse-card ${horse.is_active ? 'active' : 'inactive'}`}>
              <div className="horse-name">{horse.name}</div>
              <div className="horse-info">
                <div className="info-row">
                  <span className="label">גזע:</span>
                  <span className="value">{horse.breed || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="label">גיל:</span>
                  <span className="value">{horse.age || '—'} שנים</span>
                </div>
                <div className="info-row">
                  <span className="label">צבע:</span>
                  <span className="value">{horse.color || '—'}</span>
                </div>
              </div>
              <div className="horse-status">
                {horse.is_active ? '✓ פעיל' : '✗ לא פעיל'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="admin-section">
        <h3>משימות דורשות תשומת לב</h3>
        {tasks.filter(t => t.status === 'pending').length > 0 ? (
          <div className="pending-tasks">
            {tasks.filter(t => t.status === 'pending').slice(0, 10).map(task => (
              <div key={task.id} className="pending-task-item">
                <div className="task-date">
                  {new Date(task.scheduled_date).toLocaleDateString('he-IL')}
                </div>
                <div className="task-title">{task.title}</div>
                <div className="task-assignee">
                  {task.assigned_person?.name || 'לא הוקצה'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">כל המשימות הוקצו!</div>
        )}
      </div>
    </div>
  );
}
