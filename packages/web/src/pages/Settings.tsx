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
          <h3 className="section-title">{t('settings.language')}</h3>
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
          <h3 className="section-title">{t('settings.display')}</h3>
          <div className="setting-item">
            <div className="setting-label">
              <label>{t('settings.darkMode')}</label>
              <p className="setting-description">{t('settings.easierOnEyes')}</p>
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
          <h3 className="section-title">{t('settings.about')}</h3>
          <div className="about-content">
            <p dangerouslySetInnerHTML={{ __html: t('settings.stableOsDesc') }} />
            <p dangerouslySetInnerHTML={{ __html: t('settings.builtWith') }} />
            <div className="features-list">
              <h4>{t('settings.features')}</h4>
              <ul>
                <li>📅 {language === 'en' ? 'Today Dashboard' : 'לוח בקרה היומי'} - {language === 'en' ? 'Central hub for daily tasks' : 'מרכז מרכזי למשימות יומיות'}</li>
                <li>📆 {t('nav.calendar')} - {language === 'en' ? 'Month and week views' : 'תצוגות חודש ושבוע'}</li>
                <li>✅ {t('nav.tasks')} - {language === 'en' ? 'Create, assign, and track tasks' : 'יצירה, הקצאה ותעקוב משימות'}</li>
                <li>🐎 {t('nav.horses')} - {language === 'en' ? 'Manage all farm horses' : 'ניהול כל סוסי החווה'}</li>
                <li>👥 {t('nav.people')} - {language === 'en' ? 'Manage team members' : 'ניהול חברי צוות'}</li>
                <li>🔄 {language === 'en' ? 'Real-time Updates' : 'עדכונים בזמן אמת'} - {language === 'en' ? 'Multi-user sync across devices' : 'סנכרון מרובה משתמשים בהתקנים'}</li>
                <li>📱 {language === 'en' ? 'Installable PWA' : 'PWA הניתן להתקנה'} - {language === 'en' ? 'Works on phone, tablet, desktop' : 'עובד בטלפון, טאבלט, שולחן עבודה'}</li>
                <li>🌐 {language === 'en' ? 'Offline Support' : 'תמיכה בלא חיבור'} - {language === 'en' ? 'Service worker caching' : 'מטמון של עובד שירות'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development */}
        <div className="settings-section">
          <h3 className="section-title">{t('settings.development')}</h3>
          <div className="dev-info">
            <p className="dev-note">{t('settings.mvpVersion')}</p>
            <ul>
              <li>{t('settings.recurringTasks')}</li>
              <li>{t('settings.activityHistory')}</li>
              <li>{t('settings.darkModeTheme')}</li>
              <li>{t('settings.pushNotifications')}</li>
              <li>{t('settings.settingsConfiguration')}</li>
            </ul>
          </div>
        </div>

        {/* Help */}
        <div className="settings-section">
          <h3 className="section-title">{t('settings.help')}</h3>
          <div className="help-content">
            <div className="help-item">
              <h4>{t('settings.gettingStarted')}</h4>
              <p dangerouslySetInnerHTML={{ __html: t('settings.gettingStartedDesc') }} />
            </div>
            <div className="help-item">
              <h4>{t('settings.tips')}</h4>
              <p>{t('settings.tipsContent')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="settings-footer">
        <p className="footer-text">{t('settings.footer')}</p>
      </div>
    </div>
  );
}
