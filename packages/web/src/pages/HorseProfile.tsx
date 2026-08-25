import { useState, useEffect, useRef } from 'react';
import type { Horse, HorseHealthRecord } from '@stableos/shared';
import { getHorseHealthRecords, createHorseHealthRecord, updateHorseHealthRecord, deleteHorseHealthRecord } from '@stableos/shared';
import { success, error } from '../utils/toast';
import { useTranslation } from '../hooks/useTranslation';

interface HorseProfileProps {
  horse: Horse;
  onBack: () => void;
}

export default function HorseProfile({ horse, onBack }: HorseProfileProps) {
  const { t } = useTranslation();
  const [records, setRecords] = useState<HorseHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HorseHealthRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    recordType: 'feeding' as const,
    title: '',
    description: '',
    recordDate: new Date().toISOString().split('T')[0],
    recordTime: '',
    nextDueDate: '',
    notes: '',
  });

  useEffect(() => {
    loadRecords();
  }, [horse.id]);

  async function loadRecords() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getHorseHealthRecords(horse.id);
      setRecords(data || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('horseHealth.failedToLoad');
      setErrorMsg(errorMsg);
      console.error('Error loading records:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForm(record?: HorseHealthRecord) {
    if (record) {
      setEditingRecord(record);
      setFormData({
        recordType: record.record_type,
        title: record.title,
        description: record.description || '',
        recordDate: record.recorded_date,
        recordTime: record.recorded_time || '',
        nextDueDate: record.next_due_date || '',
        notes: record.notes || '',
      });
    } else {
      setEditingRecord(null);
      setFormData({
        recordType: 'feeding',
        title: '',
        description: '',
        recordDate: new Date().toISOString().split('T')[0],
        recordTime: '',
        nextDueDate: '',
        notes: '',
      });
    }
    setShowForm(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.recordType) {
      errors.recordType = t('horseHealth.typeRequired');
    }
    if (!formData.recordDate) {
      errors.recordDate = t('horseHealth.dateRequired');
    }
    if (!formData.title.trim()) {
      errors.title = t('horseHealth.titleRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (editingRecord) {
        await updateHorseHealthRecord(editingRecord.id, {
          record_type: formData.recordType,
          title: formData.title,
          description: formData.description || undefined,
          recorded_date: formData.recordDate,
          recorded_time: formData.recordTime || undefined,
          next_due_date: formData.nextDueDate || undefined,
          notes: formData.notes || undefined,
        });
      } else {
        await createHorseHealthRecord({
          horse_id: horse.id,
          farm_id: horse.farm_id,
          record_type: formData.recordType,
          title: formData.title,
          description: formData.description || undefined,
          recorded_date: formData.recordDate,
          recorded_time: formData.recordTime || undefined,
          next_due_date: formData.nextDueDate || undefined,
          notes: formData.notes || undefined,
        });
      }

      setShowForm(false);
      setValidationErrors({});
      success(editingRecord ? t('horseHealth.updatedSuccess') : t('horseHealth.createdSuccess'));
      loadRecords();
    } catch (err) {
      console.error('Error saving record:', err);
      const errorMsg = err instanceof Error ? err.message : t('horseHealth.failedToSave');
      setErrorMsg(errorMsg);
      error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(recordId: string) {
    if (!window.confirm(t('horseHealth.deleteConfirm'))) {
      return;
    }

    try {
      setDeletingId(recordId);
      await deleteHorseHealthRecord(recordId);
      success(t('horseHealth.deletedSuccess'));
      loadRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
      const errorMsg = err instanceof Error ? err.message : t('horseHealth.failedToDelete');
      setErrorMsg(errorMsg);
      error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  }

  const recordTypeEmojis: Record<string, string> = {
    feeding: '🍎',
    vaccination: '💉',
    farrier: '🐴',
    health_issue: '⚠️',
    vital_signs: '❤️',
    exercise: '🏃',
  };

  return (
    <div className="horse-profile">
      {/* Header with back button */}
      <div className="profile-header">
        <button className="back-button" onClick={onBack}>
          ← {t('horseRoster.title')}
        </button>
        <div className="profile-title">
          <div className="profile-emoji">🐎</div>
          <div className="profile-info">
            <h2>{horse.name}</h2>
            {horse.breed && <p className="profile-detail">Breed: {horse.breed}</p>}
            {horse.color && <p className="profile-detail">Color: {horse.color}</p>}
            {horse.age && <p className="profile-detail">Age: {horse.age} years</p>}
          </div>
        </div>
      </div>

      {/* Health Records Section */}
      <div className="health-records-section">
        <div className="section-header">
          <h3>{t('horseHealth.title')}</h3>
          <button className="add-button" onClick={() => handleOpenForm()}>
            + {t('horseHealth.addRecord')}
          </button>
        </div>

        {errorMsg && (
          <div className="error-message">
            {errorMsg}
            <button onClick={loadRecords} className="retry-button">
              {t('horseHealth.retry')}
            </button>
          </div>
        )}

        {loading && <div className="loading">{t('horseHealth.loading')}</div>}

        {!loading && (
          <>
            {/* Form Modal */}
            {showForm && (
              <div className="modal-overlay" onClick={() => setShowForm(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{editingRecord ? t('horseHealth.update') : t('horseHealth.addRecord')}</h3>
                    <button
                      className="close-button"
                      onClick={() => setShowForm(false)}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                      <label>{t('horseHealth.recordType')} *</label>
                      <select
                        value={formData.recordType}
                        onChange={e => setFormData(prev => ({ ...prev, recordType: e.target.value as any }))}
                        required
                        className={validationErrors.recordType ? 'error' : ''}
                      >
                        <option value="feeding">{t('horseHealth.feeding')}</option>
                        <option value="vaccination">{t('horseHealth.vaccination')}</option>
                        <option value="farrier">{t('horseHealth.farrier')}</option>
                        <option value="health_issue">{t('horseHealth.healthIssue')}</option>
                        <option value="vital_signs">{t('horseHealth.vitalSigns')}</option>
                        <option value="exercise">{t('horseHealth.exercise')}</option>
                      </select>
                      {validationErrors.recordType && (
                        <span className="error-text">{validationErrors.recordType}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Annual vaccination"
                        required
                        className={validationErrors.title ? 'error' : ''}
                      />
                      {validationErrors.title && (
                        <span className="error-text">{validationErrors.title}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>{t('horseHealth.description')}</label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional details..."
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('horseHealth.recordDate')} *</label>
                        <input
                          type="date"
                          value={formData.recordDate}
                          onChange={e => setFormData(prev => ({ ...prev, recordDate: e.target.value }))}
                          required
                          className={validationErrors.recordDate ? 'error' : ''}
                        />
                        {validationErrors.recordDate && (
                          <span className="error-text">{validationErrors.recordDate}</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Time</label>
                        <input
                          type="time"
                          value={formData.recordTime}
                          onChange={e => setFormData(prev => ({ ...prev, recordTime: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t('horseHealth.nextDueDate')}</label>
                      <input
                        type="date"
                        value={formData.nextDueDate}
                        onChange={e => setFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
                        placeholder="e.g., for next farrier visit"
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('horseHealth.notes')}</label>
                      <textarea
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional notes..."
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setShowForm(false)}
                        disabled={submitting}
                      >
                        {t('horseHealth.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={submitting}
                      >
                        {submitting ? `⏳ ${t('horseHealth.saving')}` : editingRecord ? t('horseHealth.update') : t('horseHealth.save')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Health Records List */}
            {records.length > 0 ? (
              <div className="records-list">
                {records.map(record => (
                  <div key={record.id} className="record-item">
                    <div className="record-emoji">
                      {recordTypeEmojis[record.record_type] || '📋'}
                    </div>
                    <div className="record-content">
                      <div className="record-title">{record.title}</div>
                      {record.description && (
                        <div className="record-description">{record.description}</div>
                      )}
                      <div className="record-meta">
                        <span className="record-date">📅 {record.recorded_date}</span>
                        {record.recorded_time && (
                          <span className="record-time">🕐 {record.recorded_time}</span>
                        )}
                        {record.next_due_date && (
                          <span className="record-next">⏰ Due: {record.next_due_date}</span>
                        )}
                      </div>
                      {record.notes && (
                        <div className="record-notes">Note: {record.notes}</div>
                      )}
                    </div>
                    <div className="record-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleOpenForm(record)}
                        disabled={deletingId === record.id}
                        title="Edit record"
                      >
                        ✎
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId !== null}
                        title="Delete record"
                      >
                        {deletingId === record.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-text">
                  {t('horseHealth.noRecords')}
                </div>
                <button className="add-button" onClick={() => handleOpenForm()}>
                  + {t('horseHealth.addRecord')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Refresh button */}
        <div className="refresh-button-container">
          <button onClick={loadRecords} className="refresh-button">
            🔄 {t('horseHealth.refresh')}
          </button>
        </div>
      </div>
    </div>
  );
}
