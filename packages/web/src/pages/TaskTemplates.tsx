import { useState, useEffect, useRef } from 'react';
import type { TaskTemplate, TaskFrequency } from '@stableos/shared';
import { getTaskTemplates, createTaskTemplate, updateTaskTemplate, deleteTaskTemplate, generateRecurringTasksFromTemplate, getFrequencyLabel } from '@stableos/shared';
import { formatPersonRole } from '@stableos/shared';
import { success, error } from '../utils/toast';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/task-templates.css';

interface TaskTemplatesProps {
  farmId: string;
}

const FREQUENCIES: TaskFrequency[] = ['daily', 'weekly', 'bi_weekly', 'monthly'];

export default function TaskTemplates({ farmId }: TaskTemplatesProps) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'weekly' as TaskFrequency,
  });

  useEffect(() => {
    loadTemplates();
  }, [farmId]);

  async function loadTemplates() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getTaskTemplates(farmId);
      setTemplates(data || []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('templates.failedToLoad'));
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForm(template?: TaskTemplate) {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        description: template.description || '',
        frequency: template.frequency,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        description: '',
        frequency: 'weekly',
      });
    }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) {
      error(t('templates.titleRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (editingTemplate) {
        await updateTaskTemplate(editingTemplate.id, {
          title: formData.title,
          description: formData.description || undefined,
          frequency: formData.frequency,
        });
        success(t('templates.updatedSuccess'));
      } else {
        await createTaskTemplate({
          farm_id: farmId,
          title: formData.title,
          description: formData.description || undefined,
          frequency: formData.frequency,
          is_active: true,
        });
        success(t('templates.createdSuccess'));
      }

      setShowForm(false);
      loadTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
      const errorMsg = err instanceof Error ? err.message : t('templates.failedToSave');
      setErrorMsg(errorMsg);
      error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(templateId: string, title: string) {
    if (!window.confirm(t('templates.deleteConfirm', { name: title }))) {
      return;
    }

    try {
      setDeletingId(templateId);
      await deleteTaskTemplate(templateId);
      success(t('templates.deletedSuccess', { name: title }));
      loadTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      const errorMsg = err instanceof Error ? err.message : t('templates.failedToDelete');
      setErrorMsg(errorMsg);
      error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleGenerateTasks(template: TaskTemplate) {
    try {
      setGeneratingId(template.id);
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Generate for next 30 days

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const startDateStr = `${year}-${month}-${day}`;

      const endYear = endDate.getFullYear();
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDate.getDate()).padStart(2, '0');
      const endDateStr = `${endYear}-${endMonth}-${endDay}`;

      await generateRecurringTasksFromTemplate(template.id, startDateStr, endDateStr);
      success(t('templates.tasksGenerated'));
    } catch (err) {
      console.error('Error generating tasks:', err);
      const errorMsg = err instanceof Error ? err.message : t('templates.failedToGenerate');
      error(errorMsg);
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <div className="templates-roster">
      {/* Header */}
      <div className="roster-header">
        <h2>{t('templates.title')}</h2>
        <button className="create-button" onClick={() => handleOpenForm()}>
          {t('templates.addTemplate')}
        </button>
      </div>

      {errorMsg && (
        <div className="error-message">
          {errorMsg}
          <button onClick={loadTemplates} className="retry-button">
            {t('templates.retry')}
          </button>
        </div>
      )}

      {loading && <div className="loading">{t('templates.loading')}</div>}

      {!loading && (
        <>
          {/* Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingTemplate ? t('templates.editTemplate') : t('templates.addTemplate')}</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label>{t('templates.templateTitle')} {t('templates.required')}</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('templates.titlePlaceholder')}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('templates.description')}</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('templates.descriptionPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('templates.frequency')}</label>
                    <select
                      value={formData.frequency}
                      onChange={e => setFormData(prev => ({ ...prev, frequency: e.target.value as TaskFrequency }))}
                    >
                      {FREQUENCIES.map(freq => (
                        <option key={freq} value={freq}>
                          {getFrequencyLabel(freq)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                    >
                      {t('templates.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={submitting}
                    >
                      {submitting ? `⏳ ${t('templates.saving')}` : editingTemplate ? t('templates.update') : t('templates.create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Templates List */}
          {templates.length > 0 ? (
            <div className="templates-list">
              {templates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="card-emoji">📋</div>
                  <div className="card-content">
                    <div className="card-title">{template.title}</div>
                    <div className="card-frequency">
                      🔄 {getFrequencyLabel(template.frequency)}
                    </div>
                    {template.description && (
                      <div className="card-description">{template.description}</div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button
                      className="generate-button"
                      onClick={() => handleGenerateTasks(template)}
                      disabled={generatingId === template.id || deletingId === template.id}
                      title={t('templates.generateTasks')}
                    >
                      {generatingId === template.id ? '⏳' : '⚡'}
                    </button>
                    <button
                      className="edit-button"
                      onClick={() => handleOpenForm(template)}
                      disabled={deletingId === template.id}
                      title="Edit template"
                    >
                      ✎
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(template.id, template.title)}
                      disabled={deletingId !== null}
                      title="Delete template"
                    >
                      {deletingId === template.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-text">
                {t('templates.noTemplates')}
              </div>
              <button className="create-button" onClick={() => handleOpenForm()}>
                {t('templates.addFirstTemplate')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadTemplates} className="refresh-button">
          🔄 {t('templates.refresh')}
        </button>
      </div>
    </div>
  );
}
