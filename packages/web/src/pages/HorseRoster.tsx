import { useState, useEffect, useRef } from 'react';
import type { Horse } from '@stableos/shared';
import { getHorses, createHorse, updateHorse, deleteHorse, subscribeToHorses } from '@stableos/shared';
import { success, error } from '../utils/toast';
import { useTranslation } from '../hooks/useTranslation';
import HorseProfile from './HorseProfile';

interface HorseRosterProps {
  farmId: string;
}

export default function HorseRoster({ farmId }: HorseRosterProps) {
  const { t } = useTranslation();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const subscriptionRef = useRef<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    color: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    microchipId: '',
    registrationNumber: '',
    temperament: '',
    medicalConditions: '',
    allergies: '',
    medications: '',
    dietRequirements: '',
    trainingLevel: '',
    emergencyContact: '',
    emergencyPhone: '',
    vetName: '',
    vetPhone: '',
    notes: '',
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
      setErrorMsg(null);
      const data = await getHorses(farmId);
      setHorses(data || []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('horseRoster.failedToLoad'));
      console.error('Error loading horses:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForm(horse?: Horse) {
    if (horse) {
      setEditingHorse(horse);
      setPhotoPreview(horse.photo_url || null);
      setPhotoFile(null);
      setFormData({
        name: horse.name,
        breed: horse.breed || '',
        color: horse.color || '',
        age: horse.age ? String(horse.age) : '',
        gender: horse.gender || '',
        height: horse.height || '',
        weight: horse.weight ? String(horse.weight) : '',
        microchipId: horse.microchip_id || '',
        registrationNumber: horse.registration_number || '',
        temperament: horse.temperament || '',
        medicalConditions: horse.medical_conditions || '',
        allergies: horse.allergies || '',
        medications: horse.medications || '',
        dietRequirements: horse.diet_requirements || '',
        trainingLevel: horse.training_level || '',
        emergencyContact: horse.emergency_contact || '',
        emergencyPhone: horse.emergency_phone || '',
        vetName: horse.vet_name || '',
        vetPhone: horse.vet_phone || '',
        notes: horse.notes || '',
      });
    } else {
      setEditingHorse(null);
      setPhotoPreview(null);
      setPhotoFile(null);
      setFormData({
        name: '',
        breed: '',
        color: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        microchipId: '',
        registrationNumber: '',
        temperament: '',
        medicalConditions: '',
        allergies: '',
        medications: '',
        dietRequirements: '',
        trainingLevel: '',
        emergencyContact: '',
        emergencyPhone: '',
        vetName: '',
        vetPhone: '',
        notes: '',
      });
    }
    setShowForm(true);
  }

  function handlePhotoChange(e: any) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      setErrorMsg(null);

      if (editingHorse) {
        await updateHorse(editingHorse.id, {
          name: formData.name,
          breed: formData.breed || undefined,
          color: formData.color || undefined,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
          gender: (formData.gender as 'male' | 'female' | '') || undefined,
          height: formData.height || undefined,
          weight: formData.weight ? parseInt(formData.weight, 10) : undefined,
          microchip_id: formData.microchipId || undefined,
          registration_number: formData.registrationNumber || undefined,
          temperament: formData.temperament || undefined,
          medical_conditions: formData.medicalConditions || undefined,
          allergies: formData.allergies || undefined,
          medications: formData.medications || undefined,
          diet_requirements: formData.dietRequirements || undefined,
          training_level: (formData.trainingLevel as 'beginner' | 'intermediate' | 'advanced' | '') || undefined,
          emergency_contact: formData.emergencyContact || undefined,
          emergency_phone: formData.emergencyPhone || undefined,
          vet_name: formData.vetName || undefined,
          vet_phone: formData.vetPhone || undefined,
          notes: formData.notes || undefined,
          photo_url: photoPreview || editingHorse.photo_url || undefined,
        });
      } else {
        await createHorse({
          farm_id: farmId,
          name: formData.name,
          breed: formData.breed || undefined,
          color: formData.color || undefined,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
          gender: (formData.gender as 'male' | 'female' | '') || undefined,
          height: formData.height || undefined,
          weight: formData.weight ? parseInt(formData.weight, 10) : undefined,
          microchip_id: formData.microchipId || undefined,
          registration_number: formData.registrationNumber || undefined,
          temperament: formData.temperament || undefined,
          medical_conditions: formData.medicalConditions || undefined,
          allergies: formData.allergies || undefined,
          medications: formData.medications || undefined,
          diet_requirements: formData.dietRequirements || undefined,
          training_level: (formData.trainingLevel as 'beginner' | 'intermediate' | 'advanced' | '') || undefined,
          emergency_contact: formData.emergencyContact || undefined,
          emergency_phone: formData.emergencyPhone || undefined,
          vet_name: formData.vetName || undefined,
          vet_phone: formData.vetPhone || undefined,
          notes: formData.notes || undefined,
          photo_url: photoPreview || undefined,
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
      setErrorMsg(errorMsg);
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
      setErrorMsg(errorMsg);
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

  if (selectedHorse) {
    return <HorseProfile horse={selectedHorse} onBack={() => setSelectedHorse(null)} />;
  }

  return (
    <div className="roster">
      {/* Header */}
      <div className="roster-header">
        <h2>{t('horseRoster.title')}</h2>
        <button className="create-button" onClick={() => handleOpenForm()}>
          {t('horseRoster.addHorse')}
        </button>
      </div>

      {errorMsg && (
        <div className="error-message">
          {errorMsg}
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

                <form onSubmit={handleSubmit} className="form horse-form">
                  {/* Photo Section */}
                  <div className="photo-section">
                    <div className="photo-preview">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Horse" className="photo-image" />
                      ) : (
                        <div className="photo-placeholder">🐎</div>
                      )}
                    </div>
                    <label className="photo-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                      <span className="photo-button">
                        {photoPreview ? t('horseRoster.changePhoto') : t('horseRoster.uploadPhoto')}
                      </span>
                    </label>
                  </div>

                  {/* Basic Info */}
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

                  <div className="form-row">
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
                    </div>
                    <div className="form-group">
                      <label>{t('horseRoster.gender')}</label>
                      <select
                        value={formData.gender}
                        onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      >
                        <option value="">Select</option>
                        <option value="male">{t('horseRoster.male')}</option>
                        <option value="female">{t('horseRoster.female')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('horseRoster.height')}</label>
                      <input
                        type="text"
                        value={formData.height}
                        onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
                        placeholder="e.g., 15.2 hh"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('horseRoster.weight')}</label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="kg"
                      />
                    </div>
                  </div>

                  {/* Identification */}
                  <div className="form-section-title">Identification</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('horseRoster.microchipId')}</label>
                      <input
                        type="text"
                        value={formData.microchipId}
                        onChange={e => setFormData(prev => ({ ...prev, microchipId: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('horseRoster.registrationNumber')}</label>
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={e => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div className="form-section-title">Characteristics</div>
                  <div className="form-group">
                    <label>{t('horseRoster.temperament')}</label>
                    <textarea
                      value={formData.temperament}
                      onChange={e => setFormData(prev => ({ ...prev, temperament: e.target.value }))}
                      placeholder="e.g., Calm, friendly, sensitive to weather"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('horseRoster.trainingLevel')}</label>
                    <select
                      value={formData.trainingLevel}
                      onChange={e => setFormData(prev => ({ ...prev, trainingLevel: e.target.value }))}
                    >
                      <option value="">Select</option>
                      <option value="beginner">{t('horseRoster.beginner')}</option>
                      <option value="intermediate">{t('horseRoster.intermediate')}</option>
                      <option value="advanced">{t('horseRoster.advanced')}</option>
                    </select>
                  </div>

                  {/* Health Info */}
                  <div className="form-section-title">Health & Medical</div>
                  <div className="form-group">
                    <label>{t('horseRoster.medicalConditions')}</label>
                    <textarea
                      value={formData.medicalConditions}
                      onChange={e => setFormData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                      placeholder="e.g., Allergic to specific feed, past injury..."
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('horseRoster.allergies')}</label>
                    <textarea
                      value={formData.allergies}
                      onChange={e => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="e.g., Penicillin allergy..."
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('horseRoster.medications')}</label>
                    <textarea
                      value={formData.medications}
                      onChange={e => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                      placeholder="e.g., Joint supplements, pain management..."
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('horseRoster.dietRequirements')}</label>
                    <textarea
                      value={formData.dietRequirements}
                      onChange={e => setFormData(prev => ({ ...prev, dietRequirements: e.target.value }))}
                      placeholder="e.g., Low sugar, specific hay type..."
                    />
                  </div>

                  {/* Emergency & Vet Info */}
                  <div className="form-section-title">Emergency & Veterinary</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('horseRoster.emergencyContact')}</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={e => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        placeholder="Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('horseRoster.emergencyPhone')}</label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={e => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                        placeholder="Phone"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('horseRoster.vetName')}</label>
                      <input
                        type="text"
                        value={formData.vetName}
                        onChange={e => setFormData(prev => ({ ...prev, vetName: e.target.value }))}
                        placeholder="Veterinarian name"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('horseRoster.vetPhone')}</label>
                      <input
                        type="tel"
                        value={formData.vetPhone}
                        onChange={e => setFormData(prev => ({ ...prev, vetPhone: e.target.value }))}
                        placeholder="Vet phone"
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="form-group">
                    <label>{t('horseRoster.notes')}</label>
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
                <div
                  key={horse.id}
                  className="roster-card"
                  onClick={() => setSelectedHorse(horse)}
                  style={{ cursor: 'pointer' }}
                >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenForm(horse);
                      }}
                      disabled={deletingId === horse.id}
                      title="Edit horse"
                    >
                      ✎
                    </button>
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(horse.id, horse.name);
                      }}
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
