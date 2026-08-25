import { useState, useRef } from 'react';
import { updateHorse } from '@stableos/shared';
import { success, error } from '../utils/toast';
import '../styles/photo-gallery.css';

interface PhotoGalleryProps {
  horseId: string;
  horseName: string;
  photoUrl?: string;
  onPhotoUpdate: (url: string | undefined) => void;
}

export default function PhotoGallery({
  horseId,
  horseName,
  photoUrl,
  onPhotoUpdate,
}: PhotoGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Update horse with photo URL
        await updateHorse(horseId, {
          photo_url: base64String,
        });

        setPreview(base64String);
        onPhotoUpdate(base64String);
        success('Photo uploaded successfully');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading photo:', err);
      error(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    if (!window.confirm('Remove this photo?')) return;

    try {
      await updateHorse(horseId, {
        photo_url: undefined,
      });

      setPreview(null);
      onPhotoUpdate(undefined);
      success('Photo removed successfully');
    } catch (err) {
      console.error('Error removing photo:', err);
      error('Failed to remove photo');
    }
  }

  return (
    <div className="photo-gallery">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        hidden
      />

      {preview ? (
        <div className="photo-display">
          <img src={preview} alt={horseName} className="horse-photo" />
          <div className="photo-actions">
            <button
              className="change-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Change photo"
            >
              {uploading ? '⏳' : '📷'}
            </button>
            <button
              className="remove-button"
              onClick={handleRemovePhoto}
              disabled={uploading}
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="photo-placeholder">
          <div className="placeholder-icon">🖼️</div>
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⏳ Uploading...' : '📷 Upload Photo'}
          </button>
        </div>
      )}
    </div>
  );
}
