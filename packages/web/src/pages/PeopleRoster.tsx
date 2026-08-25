import { useState, useEffect, useRef } from 'react';
import type { Person, PersonRole } from '@stableos/shared';
import { getPeople, createPerson, updatePerson, deletePerson, subscribeToPeople } from '@stableos/shared';
import { formatPersonRole } from '@stableos/shared';

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
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
      setError(err instanceof Error ? err.message : 'Failed to load people');
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
      errors.name = 'Name is required';
    }
    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
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
      loadPeople();
    } catch (err) {
      console.error('Error saving person:', err);
      setError(err instanceof Error ? err.message : 'Failed to save person');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(personId: string, personName: string) {
    if (!window.confirm(`Are you sure you want to delete ${personName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(personId);
      await deletePerson(personId);
      loadPeople();
    } catch (err) {
      console.error('Error deleting person:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete person');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="roster">
      {/* Header */}
      <div className="roster-header">
        <h2>👥 Team Members</h2>
        <button className="create-button" onClick={() => handleOpenForm()}>
          ➕ Add Person
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadPeople} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading team members...</div>}

      {!loading && (
        <>
          {/* Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingPerson ? 'Edit Person' : 'Add Team Member'}</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter name"
                      required
                      className={validationErrors.name ? 'error' : ''}
                    />
                    {validationErrors.name && (
                      <span className="error-text">{validationErrors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Role</label>
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
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      className={validationErrors.email ? 'error' : ''}
                    />
                    {validationErrors.email && (
                      <span className="error-text">{validationErrors.email}</span>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={submitting}
                    >
                      {submitting ? '⏳ Saving...' : editingPerson ? 'Update Person' : 'Add Person'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* People Grid */}
          {people.length > 0 ? (
            <div className="roster-grid">
              {people.map(person => (
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
              <div className="empty-text">No team members yet</div>
              <button className="create-button" onClick={() => handleOpenForm()}>
                ➕ Add Your First Member
              </button>
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadPeople} className="refresh-button">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
