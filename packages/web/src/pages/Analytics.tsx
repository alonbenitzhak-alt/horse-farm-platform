import { useState, useEffect } from 'react';
import { getFarmAnalytics, getExpenseAnalytics } from '@stableos/shared';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/analytics.css';

interface AnalyticsProps {
  farmId: string;
}

export default function Analytics({ farmId }: AnalyticsProps) {
  const { t } = useTranslation();
  const [farmAnalytics, setFarmAnalytics] = useState<any>(null);
  const [expenseAnalytics, setExpenseAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [farmId]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [farm, expenses] = await Promise.all([
        getFarmAnalytics(farmId),
        getExpenseAnalytics(farmId),
      ]);

      setFarmAnalytics(farm);
      setExpenseAnalytics(expenses);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('analytics.failedToLoad'));
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="analytics-container"><div className="loading">{t('analytics.loading')}</div></div>;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>{t('analytics.title')}</h2>
        <button onClick={loadAnalytics} className="refresh-button">
          🔄 {t('analytics.refresh')}
        </button>
      </div>

      {errorMsg && (
        <div className="error-message">
          {errorMsg}
          <button onClick={loadAnalytics} className="retry-button">
            {t('analytics.retry')}
          </button>
        </div>
      )}

      {/* Farm Analytics Section */}
      <div className="analytics-section">
        <h3>{t('analytics.farmMetrics')}</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">🐎</div>
            <div className="metric-content">
              <div className="metric-label">{t('analytics.totalHorses')}</div>
              <div className="metric-value">{farmAnalytics?.totalHorses || 0}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <div className="metric-label">{t('analytics.teamMembers')}</div>
              <div className="metric-value">{farmAnalytics?.totalStaff || 0}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <div className="metric-label">{t('analytics.totalTasks')}</div>
              <div className="metric-value">{farmAnalytics?.totalTasks || 0}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-label">{t('analytics.completionRate')}</div>
              <div className="metric-value">{farmAnalytics?.averageTaskCompletionRate || 0}%</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📅</div>
            <div className="metric-content">
              <div className="metric-label">{t('analytics.completedThisMonth')}</div>
              <div className="metric-value">{farmAnalytics?.completedTasksThisMonth || 0}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⚠️</div>
            <div className="metric-content">
              <div className="metric-label">{t('analytics.upcomingMaintenance')}</div>
              <div className="metric-value">{farmAnalytics?.upcomingMaintenance || 0}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-label">{t('analytics.healthRecords')}</div>
              <div className="metric-value">{farmAnalytics?.totalHealthRecords || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Analytics Section */}
      <div className="analytics-section">
        <h3>{t('analytics.expenseMetrics')}</h3>
        <div className="expense-summary">
          <div className="expense-card">
            <div className="card-label">{t('analytics.totalExpenses')}</div>
            <div className="card-value">${expenseAnalytics?.totalExpenses?.toFixed(2) || '0.00'}</div>
          </div>

          <div className="expense-card">
            <div className="card-label">{t('analytics.averagePerDay')}</div>
            <div className="card-value">${expenseAnalytics?.averagePerDay?.toFixed(2) || '0.00'}</div>
          </div>

          <div className="expense-card">
            <div className="card-label">{t('analytics.largestExpense')}</div>
            <div className="card-value">${expenseAnalytics?.largestExpense?.amount?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="category-breakdown">
          <h4>{t('analytics.byCategory')}</h4>
          <div className="category-list">
            {Object.entries(expenseAnalytics?.byCategory || {}).map(([category, amount]: any) => (
              <div key={category} className="category-row">
                <div className="category-name">{t(`expenses.${category}`)}</div>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{
                      width: `${((amount / (expenseAnalytics?.totalExpenses || 1)) * 100) || 0}%`,
                    }}
                  ></div>
                </div>
                <div className="category-amount">${amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Completion Gauge */}
      <div className="analytics-section">
        <h3>{t('analytics.performanceMetrics')}</h3>
        <div className="gauge-container">
          <div className="gauge">
            <div className="gauge-label">{t('analytics.taskCompletion')}</div>
            <div className="gauge-circle">
              <svg viewBox="0 0 100 100" className="gauge-svg">
                <circle cx="50" cy="50" r="45" className="gauge-background" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="gauge-progress"
                  style={{
                    strokeDashoffset: `${283 - (farmAnalytics?.averageTaskCompletionRate || 0) * 2.83}`,
                  }}
                />
              </svg>
              <div className="gauge-value">{farmAnalytics?.averageTaskCompletionRate || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="analytics-section">
        <h3>{t('analytics.keyInsights')}</h3>
        <div className="insights-list">
          {farmAnalytics?.upcomingMaintenance > 0 && (
            <div className="insight-item insight-warning">
              ⚠️ {t('analytics.upcomingTasksWarning', { count: farmAnalytics?.upcomingMaintenance })}
            </div>
          )}

          {farmAnalytics?.averageTaskCompletionRate < 50 && (
            <div className="insight-item insight-warning">
              📋 {t('analytics.lowCompletionRate')}
            </div>
          )}

          {farmAnalytics?.averageTaskCompletionRate >= 80 && (
            <div className="insight-item insight-success">
              ✅ {t('analytics.excellentCompletion')}
            </div>
          )}

          {expenseAnalytics?.totalExpenses > 0 && (
            <div className="insight-item insight-info">
              💰 {t('analytics.totalSpentInfo', { amount: expenseAnalytics?.totalExpenses?.toFixed(2) })}
            </div>
          )}

          {farmAnalytics?.totalHorses === 0 && (
            <div className="insight-item insight-info">
              🐎 {t('analytics.noHorsesYet')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
