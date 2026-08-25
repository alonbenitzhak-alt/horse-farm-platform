import { useState, useEffect, useRef } from 'react';
import type { Horse } from '@stableos/shared';
import { getHorses, createHorse, updateHorse, deleteHorse, subscribeToHorses } from '@stableos/shared';
import { success, error } from '../utils/toast';
import { useTranslation } from '../hooks/useTranslation';

interface HorseRosterProps {
  farmId: string;
}

export default function HorseRoster({ farmId }: HorseRosterProps) {
  const { t } = useTranslation();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const subscriptionRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    color: '',
    age: '',
  });

  useEffect(() => {
    loadHorses();

    try {
      subscriptionRef.current = subscribeToHorses(farmId, setHorses);
    } catch (err) {
      console.warn('Real-time subscriptions unavailable:', err);
    }

    return () => {
      subscriptionRef.current?.unsubscribe?.();
    };
  }, [farmId]);

  async function loadHorses() {
    try {
      setLoading(true);
      setError(null);
      const data = await getHorses(farmId);
      setHorses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('horseRoster.failedToLoad'));
      console.error('Error loading horses:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForm(horse?: Horse) {
    if (horse) {
      setEditingHorse(horse);
      setFormData({
        name: horse.name,
        breed: horse.breed || '',
        color: horse.color || '',
        age: horse.age ? String(horse.age) : '',
      });
    } else {
      setEditingHorse(null);
      setFormData({
        name: '',
        breed: '',
        color: '',
        age: '',
      });
    }
    setShowForm(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t('horseRoster.nameRequired');
    }
    if (formData.age && (isNaN(parseInt(formData.age)) || parseInt(formData.age) < 0)) {
      errors.age = t('horseRoster.invalidAge');
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

      if (editingHorse) {
        await updateHorse(editingHorse.id, {
          name: formData.name,
          breed: formData.breed || undefined,
          color: formData.color || undefined,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
        });
      } else {
        await createHorse({
          farm_id: farmId,
          name: formData.name,
          breed: formData.breed || undefined,
          color: formData.color || undefined,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
          is_active: true,
        });
      }

      setShowForm(false);
      setValidationErrors({});
      success(editingHorse ? t('horseRoster.updatedSuccess') : t('horseRoster.addedSuccess'));
      loadHorses();
    } catch (err) {
      console.error('Error saving horse:', err);
      const errorMsg = err instanceof Error ? err.message : t('horseRoster.failedToSave');
      setError(errorMsg);
      error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(horseId: string, horseName: string) {
    if (!window.confirm(t('horseRoster.deleteConfirm', { name: horseName }))) {
      return;
    }

    try {
      setDeletingId(horseId);
      await deleteHorse(horseId);
      success(t('horseRoster.deletedSuccess', { name: horseName }));
      loadHorses();
    } catch (err) {
      console.error('Error deleting horse:', err);
      const errorMsg = err instanceof Error ? err.message : t('horseRoster.failedToDelete');
      setError(errorMsg);
      error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredHorses = horses.filter(horse =>
    horse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (horse.breed && horse.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (horse.color && horse.color.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="roster">
      {/* Header */}
      <div className="roster-header">
        <h2>{t('horseRoster.title')}</h2>
        <button className="create-button" onClick={() => handleOpenForm()}>
          {t('horseRoster.addHorse')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadHorses} className="retry-button">
            {t('horseRoster.retry')}
          </button>
        </div>
      )}

      {loading && <div className="loading">{t('horseRoster.loading')}</div>}

      {!loading && (
        <>
          {/* Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingHorse ? t('horseRoster.editHorse') : t('horseRoster.addNewHorse')}</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label>{t('horseRoster.horseName')} *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter horse name"
                      required
                      className={validationErrors.name ? 'error' : ''}
                    />
                    {validationErrors.name && (
                      <span className="error-text">{validationErrors.name}</span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('horseRoster.breed')}</label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={e => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                        placeholder="e.g., Thoroughbred"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('horseRoster.color')}</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="e.g., Bay"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t('horseRoster.age')}</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="e.g., 5"
                      min="0"
                      max="50"
                      className={validationErrors.age ? 'error' : ''}
                    />
                    {validationErrors.age && (
                      <span className="error-text">{validationErrors.age}</span>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                    >
                      {t('horseRoster.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={submitting}
                    >
                      {submitting ? `⏳ ${t('horseRoster.saving')}` : editingHorse ? t('horseRoster.update') : t('horseRoster.add')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {horses.length > 0 && (
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={t('horseRoster.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Horses Grid */}
          {filteredHorses.length > 0 ? (
            <div className="roster-grid">
              {filteredHorses.map(horse => (
                <div key={horse.id} className="roster-card">
                  <div className="card-emoji">🐎</div>
                  <div className="card-content">
                    <div className="card-name">{horse.name}</div>
                    {horse.breed && (
                      <div className="card-detail">Breed: {horse.breed}</div>
                    )}
                    {horse.color && (
                      <div className="card-detail">Color: {horse.color}</div>
                    )}
                    {horse.age && (
                      <div className="card-detail">Age: {horse.age} years</div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleOpenForm(horse)}
                      disabled={deletingId === horse.id}
                      title="Edit horse"
                    >
                      ✎
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(horse.id, horse.name)}
                      disabled={deletingId !== null}
                      title="Delete horse"
                    >
                      {deletingId === horse.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🐎</div>
              <div className="empty-text">
                {searchQuery ? t('horseRoster.notFound') : t('horseRoster.noHorses')}
              </div>
              {!searchQuery && (
                <button className="create-button" onClick={() => handleOpenForm()}>
                  {t('horseRoster.addFirstHorse')}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadHorses} className="refresh-button">
          🔄 {t('horseRoster.refresh')}
        </button>
      </div>
    </div>
  );
}
