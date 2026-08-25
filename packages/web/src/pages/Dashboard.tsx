import { useState, useEffect } from 'react';
import { getHorses, getTasks, getEvents, getFarmUsers } from '@stableos/shared';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/dashboard.css';

interface DashboardProps {
  farmId: string;
}

export default function Dashboard({ farmId }: DashboardProps) {
  const { t } = useTranslation();
  const [horsesCount, setHorsesCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [farmId]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [horses, tasks, events, people] = await Promise.all([
        getHorses(farmId),
        getTasks(farmId),
        getEvents(farmId),
        getFarmUsers(farmId),
      ]);

      setHorsesCount(horses?.length || 0);
      setTotalTasksCount(tasks?.length || 0);
      setCompletedTasksCount(tasks?.filter(t => t.status === 'completed').length || 0);

      const now = new Date();
      const upcomingEvents = events?.filter(e => new Date(e.date) > now).length || 0;
      setUpcomingEventsCount(upcomingEvents);
      setTeamMembersCount(people?.length || 0);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">{t('dashboard.loading')}</div>
      </div>
    );
  }

  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{t('dashboard.title')}</h2>
        <button onClick={loadDashboardData} className="refresh-button">
          🔄 {t('dashboard.refresh')}
        </button>
      </div>

      {errorMsg && (
        <div className="error-message">
          {errorMsg}
          <button onClick={loadDashboardData} className="retry-button">
            {t('dashboard.retry')}
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">🐎</div>
          <div className="stat-content">
            <div className="stat-value">{horsesCount}</div>
            <div className="stat-label">{t('dashboard.horses')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{totalTasksCount}</div>
            <div className="stat-label">{t('dashboard.totalTasks')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{completedTasksCount}</div>
            <div className="stat-label">{t('dashboard.completedTasks')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{upcomingEventsCount}</div>
            <div className="stat-label">{t('dashboard.upcomingEvents')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{teamMembersCount}</div>
            <div className="stat-label">{t('dashboard.teamMembers')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{completionPercentage}%</div>
            <div className="stat-label">{t('dashboard.completion')}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-progress">
        <h3>{t('dashboard.taskProgress')}</h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {completedTasksCount} {t('dashboard.of')} {totalTasksCount} {t('dashboard.tasksCompleted')}
        </div>
      </div>
    </div>
  );
}
