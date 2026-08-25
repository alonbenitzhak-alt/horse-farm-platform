import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import type { LanguageCode } from '../i18n/translations';

interface SettingsProps {
  farmId: string;
}

export default function Settings({ farmId }: SettingsProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="settings">
      {/* Header */}
      <div className="settings-header">
        <h2>⚙️ {t('settings.title')}</h2>
      </div>

      {/* Settings Sections */}
      <div className="settings-sections">
        {/* Language Settings */}
        <div className="settings-section">
          <h3 className="section-title">🌐 {t('settings.language')}</h3>
          <div className="language-buttons">
            <button
              className={`language-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              {t('settings.English')}
            </button>
            <button
              className={`language-button ${language === 'he' ? 'active' : ''}`}
              onClick={() => setLanguage('he')}
            >
              {t('settings.Hebrew')}
            </button>
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <h3 className="section-title">🎨 Display</h3>
          <div className="setting-item">
            <div className="setting-label">
              <label>{t('settings.darkMode')}</label>
              <p className="setting-description">Easier on the eyes in low light</p>
            </div>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={e => setDarkMode(e.target.checked)}
              className="toggle-checkbox"
              disabled
            />
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <h3 className="section-title">ℹ️ About</h3>
          <div className="about-content">
            <p>
              <strong>StableOS</strong> is a mobile-first Horse Farm Operations Platform designed
              to answer: "What needs to happen at the farm today, who is responsible for it, when
              does it need to happen, and has it been completed?"
            </p>
            <p>
              Built with <strong>React + Vite</strong> as a responsive PWA, powered by
              <strong> Supabase</strong> for real-time data sync.
            </p>
            <div className="features-list">
              <h4>Features:</h4>
              <ul>
                <li>📅 Today Dashboard - Central hub for daily tasks</li>
                <li>📆 Calendar - Month and week views</li>
                <li>✅ Task Management - Create, assign, and track tasks</li>
                <li>🐎 Horse Roster - Manage all farm horses</li>
                <li>👥 People Roster - Manage team members</li>
                <li>🔄 Real-time Updates - Multi-user sync across devices</li>
                <li>📱 Installable PWA - Works on phone, tablet, desktop</li>
                <li>🌐 Offline Support - Service worker caching</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development */}
        <div className="settings-section">
          <h3 className="section-title">👨‍💻 Development</h3>
          <div className="dev-info">
            <p className="dev-note">
              This is the <strong>MVP (Minimum Viable Product)</strong> version. Additional features
              coming soon:
            </p>
            <ul>
              <li>Recurring Tasks (from templates)</li>
              <li>Activity History/Audit Log</li>
              <li>Dark Mode Theme</li>
              <li>Push Notifications</li>
              <li>Settings Configuration</li>
            </ul>
          </div>
        </div>

        {/* Help */}
        <div className="settings-section">
          <h3 className="section-title">❓ Help</h3>
          <div className="help-content">
            <div className="help-item">
              <h4>Getting Started</h4>
              <p>
                1. Add your team members in the <strong>People</strong> tab<br />
                2. Add your horses in the <strong>Horses</strong> tab<br />
                3. Create tasks in the <strong>Tasks</strong> tab<br />
                4. View today's tasks in the <strong>Today</strong> tab<br />
                5. Check the <strong>Calendar</strong> for upcoming events
              </p>
            </div>
            <div className="help-item">
              <h4>Tips</h4>
              <ul>
                <li>Tasks can be assigned to team members</li>
                <li>Tasks can be linked to one or more horses</li>
                <li>Use the calendar to plan ahead</li>
                <li>All changes sync in real-time across devices</li>
                <li>The app works offline and syncs when back online</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="settings-footer">
        <p className="footer-text">
          Built for family farms. Data synced securely via Supabase.
        </p>
      </div>
    </div>
  );
}
