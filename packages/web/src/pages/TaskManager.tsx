import { useState, useEffect } from 'react';
import type { TaskWithDetails, Horse, Person } from '@stableos/shared';
import { getTasks, createTask, updateTask, deleteTask, getHorses, getPeople } from '@stableos/shared';
import { formatDate, formatTime, formatTaskStatus } from '@stableos/shared';
import { success, error } from '../utils/toast';
import { useTranslation } from '../hooks/useTranslation';

interface TaskManagerProps {
  farmId: string;
  currentUserId?: string;
}

export default function TaskManager({ farmId, currentUserId }: TaskManagerProps) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    scheduled_date: string;
    scheduled_time: string;
    assigned_to: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    horse_ids: string[];
  }>({
    title: '',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '',
    assigned_to: '',
    status: 'pending',
    horse_ids: [],
  });

  useEffect(() => {
    loadData();
  }, [farmId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [taskData, horseData, peopleData] = await Promise.all([
        getTasks(farmId),
        getHorses(farmId),
        getPeople(farmId),
      ]);
      setTasks(taskData || []);
      setHorses(horseData || []);
      setPeople(peopleData || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('taskManager.failedToLoad');
      setError(errorMsg);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForm(task?: TaskWithDetails) {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        scheduled_date: task.scheduled_date,
        scheduled_time: task.scheduled_time || '',
        assigned_to: task.assigned_to || '',
        status: task.status,
        horse_ids: task.horses?.map(h => h.id) || [],
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '',
        assigned_to: '',
        status: 'pending',
        horse_ids: [],
      });
    }
    setShowForm(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = t('taskManager.titleRequired');
    }
    if (!formData.scheduled_date) {
      errors.scheduled_date = t('taskManager.dateRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      if (editingTask) {
        await updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description || undefined,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time || undefined,
          assigned_to: formData.assigned_to || undefined,
          status: formData.status,
        });
      } else {
        await createTask(
          {
            farm_id: farmId,
            title: formData.title,
            description: formData.description || undefined,
            scheduled_date: formData.scheduled_date,
            scheduled_time: formData.scheduled_time || undefined,
            assigned_to: formData.assigned_to || undefined,
            status: formData.status,
          },
          formData.horse_ids.length > 0 ? formData.horse_ids : undefined
        );
      }

      setShowForm(false);
      setValidationErrors({});
      success(editingTask ? t('taskManager.updatedSuccess') : t('taskManager.createdSuccess'));
      loadData();
    } catch (err) {
      console.error('Error saving task:', err);
      const errorMsg = err instanceof Error ? err.message : t('taskManager.failedToSave');
      setError(errorMsg);
      error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(taskId: string, taskTitle: string) {
    if (!window.confirm(t('taskManager.deleteConfirm', { title: taskTitle }))) {
      return;
    }

    try {
      setDeletingId(taskId);
      await deleteTask(taskId);
      success(t('taskManager.deletedSuccess', { title: taskTitle }));
      loadData();
    } catch (err) {
      console.error('Error deleting task:', err);
      const errorMsg = err instanceof Error ? err.message : t('taskManager.failedToDelete');
      setError(errorMsg);
      error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  }

  function handleToggleHorse(horseId: string) {
    setFormData(prev => ({
      ...prev,
      horse_ids: prev.horse_ids.includes(horseId)
        ? prev.horse_ids.filter(id => id !== horseId)
        : [...prev.horse_ids, horseId],
    }));
  }

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = filterStatus === 'all' ? true : t.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="task-manager">
      {/* Header */}
      <div className="task-manager-header">
        <h2>{t('taskManager.title')}</h2>
        <button className="create-button" onClick={() => handleOpenForm()}>
          {t('taskManager.newTask')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadData} className="retry-button">
            {t('taskManager.retry')}
          </button>
        </div>
      )}

      {loading && <div className="loading">{t('taskManager.loading')}</div>}

      {!loading && (
        <>
          {/* Filters */}
          <div className="task-filters">
            <button
              className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              {t('taskManager.all')} ({tasks.length})
            </button>
            <button
              className={`filter-button ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              {t('taskManager.pending')} ({tasks.filter(t => t.status === 'pending').length})
            </button>
            <button
              className={`filter-button ${filterStatus === 'in_progress' ? 'active' : ''}`}
              onClick={() => setFilterStatus('in_progress')}
            >
              {t('taskManager.inProgress')} ({tasks.filter(t => t.status === 'in_progress').length})
            </button>
            <button
              className={`filter-button ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              {t('taskManager.completed')} ({tasks.filter(t => t.status === 'completed').length})
            </button>
          </div>

          {/* Search Bar */}
          {tasks.length > 0 && (
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={t('taskManager.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  title={t('taskManager.searchPlaceholder')}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Task Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingTask ? t('taskManager.editTask') : t('taskManager.newTaskForm')}</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="task-form">
                  <div className="form-group">
                    <label>{t('taskManager.taskTitle')} *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('taskManager.taskTitle')}
                      required
                      className={validationErrors.title ? 'error' : ''}
                    />
                    {validationErrors.title && (
                      <span className="error-text">{validationErrors.title}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>{t('taskManager.description')}</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('taskManager.descriptionOptional')}
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('taskManager.date')} *</label>
                      <input
                        type="date"
                        value={formData.scheduled_date}
                        onChange={e => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                        required
                        className={validationErrors.scheduled_date ? 'error' : ''}
                      />
                      {validationErrors.scheduled_date && (
                        <span className="error-text">{validationErrors.scheduled_date}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>{t('taskManager.time')}</label>
                      <input
                        type="time"
                        value={formData.scheduled_time}
                        onChange={e => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('taskManager.assignTo')}</label>
                      <select
                        value={formData.assigned_to}
                        onChange={e => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                      >
                        <option value="">{t('taskManager.unassigned')}</option>
                        {people.map(person => (
                          <option key={person.id} value={person.id}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t('taskManager.status')}</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      >
                        <option value="pending">{t('taskManager.pending')}</option>
                        <option value="in_progress">{t('taskManager.inProgress')}</option>
                        <option value="completed">{t('taskManager.completed')}</option>
                        <option value="cancelled">{t('taskManager.cancelled')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t('taskManager.horsesInvolved')}</label>
                    <div className="horse-checkboxes">
                      {horses.length > 0 ? (
                        horses.map(horse => (
                          <label key={horse.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.horse_ids.includes(horse.id)}
                              onChange={() => handleToggleHorse(horse.id)}
                            />
                            <span>{horse.name}</span>
                          </label>
                        ))
                      ) : (
                        <p className="empty-text">{t('taskManager.noHorses')}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                    >
                      {t('taskManager.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={submitting}
                    >
                      {submitting ? `⏳ ${t('taskManager.saving')}` : editingTask ? t('taskManager.update') : t('taskManager.create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tasks List */}
          {filteredTasks.length > 0 ? (
            <div className="tasks-list">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
                >
                  <div className="task-item-main">
                    <div className="task-item-title">{task.title}</div>
                    {task.description && (
                      <div className="task-item-description">{task.description}</div>
                    )}
                    <div className="task-item-meta">
                      <span className="task-date">📅 {formatDate(task.scheduled_date)}</span>
                      {task.scheduled_time && (
                        <span className="task-time">🕐 {formatTime(task.scheduled_time)}</span>
                      )}
                      <span className={`task-status status-${task.status}`}>
                        {formatTaskStatus(task.status)}
                      </span>
                    </div>
                    {task.assigned_person && (
                      <div className="task-assigned">👤 {task.assigned_person.name}</div>
                    )}
                    {task.horses && task.horses.length > 0 && (
                      <div className="task-horses">
                        🐎 {task.horses.map((h: any) => h.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="task-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleOpenForm(task)}
                      disabled={deletingId === task.id}
                      title="Edit task"
                    >
                      ✎
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(task.id, task.title)}
                      disabled={deletingId !== null}
                      title="Delete task"
                    >
                      {deletingId === task.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-text">
                {searchQuery ? 'No tasks found' : `No ${filterStatus !== 'all' ? filterStatus : ''} tasks`}
              </div>
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadData} className="refresh-button">
          🔄 {t('taskManager.refresh')}
        </button>
      </div>
    </div>
  );
}
