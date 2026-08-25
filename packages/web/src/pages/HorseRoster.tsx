import { useState, useEffect } from 'react';
import type { Horse } from '@stableos/shared';
import { getHorses, createHorse, updateHorse } from '@stableos/shared';

interface HorseRosterProps {
  farmId: string;
}

export default function HorseRoster({ farmId }: HorseRosterProps) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    color: '',
    age: '',
  });

  useEffect(() => {
    loadHorses();
  }, [farmId]);

  async function loadHorses() {
    try {
      setLoading(true);
      setError(null);
      const data = await getHorses(farmId);
      setHorses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load horses');
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

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        alert('Horse name is required');
        return;
      }

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
      loadHorses();
    } catch (err) {
      console.error('Error saving horse:', err);
      alert('Failed to save horse');
    }
  }

  return (
    <div className="roster">
      {/* Header */}
      <div className="roster-header">
        <h2>🐎 Horses</h2>
        <button className="create-button" onClick={() => handleOpenForm()}>
          ➕ Add Horse
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadHorses} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading horses...</div>}

      {!loading && (
        <>
          {/* Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingHorse ? 'Edit Horse' : 'Add Horse'}</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label>Horse Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter horse name"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Breed</label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={e => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                        placeholder="e.g., Thoroughbred"
                      />
                    </div>
                    <div className="form-group">
                      <label>Color</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="e.g., Bay"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Age (years)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="e.g., 5"
                      min="0"
                      max="50"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-button">
                      {editingHorse ? 'Update Horse' : 'Add Horse'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Horses Grid */}
          {horses.length > 0 ? (
            <div className="roster-grid">
              {horses.map(horse => (
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
                  <button
                    className="edit-button"
                    onClick={() => handleOpenForm(horse)}
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🐎</div>
              <div className="empty-text">No horses yet</div>
              <button className="create-button" onClick={() => handleOpenForm()}>
                ➕ Add Your First Horse
              </button>
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadHorses} className="refresh-button">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
