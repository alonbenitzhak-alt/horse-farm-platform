import { useState, useEffect, useRef } from 'react';
import type { Person, PersonRole } from '@stableos/shared';
import { getPeople, createPerson, updatePerson, deletePerson, subscribeToPeople } from '@stableos/shared';
import { formatPersonRole } from '@stableos/shared';
import { success, error } from '../utils/toast';
import { useTranslation } from '../hooks/useTranslation';

interface PeopleRosterProps {
  farmId: string;
}

const ROLES: PersonRole[] = ['owner', 'staff', 'instructor', 'vet', 'farrier', 'other'];
const ROLE_EMOJI: Record<PersonRole, string> = {
  owner: '👑',
  staff: '👤',
  instructor: '🎓',
  vet: '⚕️',
  farrier: '🔨',
  other: '👥',
};

export default function PeopleRoster({ farmId }: PeopleRosterProps) {
  const { t } = useTranslation();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const subscriptionRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'staff' as PersonRole,
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadPeople();

    try {
      subscriptionRef.current = subscribeToPeople(farmId, setPeople);
    } catch (err) {
      console.warn('Real-time subscriptions unavailable:', err);
    }

    return () => {
      subscriptionRef.current?.unsubscribe?.();
    };
  }, [farmId]);

  async function loadPeople() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPeople(farmId);
      setPeople(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('peopleRoster.failedToLoad'));
      console.error('Error loading people:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForm(person?: Person) {
    if (person) {
      setEditingPerson(person);
      setFormData({
        name: person.name,
        role: person.role,
        phone: person.phone || '',
        email: person.email || '',
      });
    } else {
      setEditingPerson(null);
      setFormData({
        name: '',
        role: 'staff',
        phone: '',
        email: '',
      });
    }
    setShowForm(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t('peopleRoster.nameRequired');
    }
    if (formData.email && !formData.email.includes('@')) {
      errors.email = t('peopleRoster.invalidEmail');
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

      if (editingPerson) {
        await updatePerson(editingPerson.id, {
          name: formData.name,
          role: formData.role,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        });
      } else {
        await createPerson({
          farm_id: farmId,
          name: formData.name,
          role: formData.role,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          is_active: true,
        });
      }

      setShowForm(false);
      setValidationErrors({});
      success(editingPerson ? t('peopleRoster.updatedSuccess') : t('peopleRoster.addedSuccess'));
      loadPeople();
    } catch (err) {
      console.error('Error saving person:', err);
      const errorMsg = err instanceof Error ? err.message : t('peopleRoster.failedToSave');
      setError(errorMsg);
      error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(personId: string, personName: string) {
    if (!window.confirm(t('peopleRoster.deleteConfirm', { name: personName }))) {
      return;
    }

    try {
      setDeletingId(personId);
      await deletePerson(personId);
      success(t('peopleRoster.deletedSuccess', { name: personName }));
      loadPeople();
    } catch (err) {
      console.error('Error deleting person:', err);
      const errorMsg = err instanceof Error ? err.message : t('peopleRoster.failedToDelete');
      setError(errorMsg);
      error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (person.email && person.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (person.phone && person.phone.includes(searchQuery))
  );

  return (
    <div className="roster">
      {/* Header */}
      <div className="roster-header">
        <h2>{t('peopleRoster.title')}</h2>
        <button className="create-button" onClick={() => handleOpenForm()}>
          {t('peopleRoster.addPerson')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadPeople} className="retry-button">
            {t('peopleRoster.retry')}
          </button>
        </div>
      )}

      {loading && <div className="loading">{t('peopleRoster.loading')}</div>}

      {!loading && (
        <>
          {/* Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingPerson ? t('peopleRoster.editPerson') : t('peopleRoster.addTeamMember')}</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label>{t('peopleRoster.name')} {t('peopleRoster.required')}</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('peopleRoster.name')}
                      required
                      className={validationErrors.name ? 'error' : ''}
                    />
                    {validationErrors.name && (
                      <span className="error-text">{t('peopleRoster.nameRequired')}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>{t('peopleRoster.role')}</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as PersonRole }))}
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>
                          {formatPersonRole(role)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('peopleRoster.phone')}</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={t('peopleRoster.phone')}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('peopleRoster.email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t('peopleRoster.email')}
                      className={validationErrors.email ? 'error' : ''}
                    />
                    {validationErrors.email && (
                      <span className="error-text">{t('peopleRoster.invalidEmail')}</span>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                    >
                      {t('peopleRoster.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={submitting}
                    >
                      {submitting ? `⏳ ${t('peopleRoster.saving')}` : editingPerson ? t('peopleRoster.update') : t('peopleRoster.add')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {people.length > 0 && (
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={`🔍 ${t('peopleRoster.searchPlaceholder')}`}
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

          {/* People Grid */}
          {filteredPeople.length > 0 ? (
            <div className="roster-grid">
              {filteredPeople.map(person => (
                <div key={person.id} className="roster-card">
                  <div className="card-emoji">{ROLE_EMOJI[person.role]}</div>
                  <div className="card-content">
                    <div className="card-name">{person.name}</div>
                    <div className="card-detail">{formatPersonRole(person.role)}</div>
                    {person.phone && (
                      <div className="card-detail">📱 {person.phone}</div>
                    )}
                    {person.email && (
                      <div className="card-detail">✉️ {person.email}</div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleOpenForm(person)}
                      disabled={deletingId === person.id}
                      title="Edit person"
                    >
                      ✎
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(person.id, person.name)}
                      disabled={deletingId !== null}
                      title="Delete person"
                    >
                      {deletingId === person.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-text">
                {searchQuery ? t('peopleRoster.notFound') : t('peopleRoster.noMembers')}
              </div>
              {!searchQuery && (
                <button className="create-button" onClick={() => handleOpenForm()}>
                  {t('peopleRoster.addFirstMember')}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadPeople} className="refresh-button">
          🔄 {t('peopleRoster.refresh')}
        </button>
      </div>
    </div>
  );
}
