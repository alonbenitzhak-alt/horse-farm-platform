import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TodayDashboard from './pages/TodayDashboard';
import Calendar from './pages/Calendar';
import TaskManager from './pages/TaskManager';
import TaskTemplates from './pages/TaskTemplates';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import HorseRoster from './pages/HorseRoster';
import PeopleRoster from './pages/PeopleRoster';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Toast from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { useTranslation } from './hooks/useTranslation';
import './App.css';
import './styles/dashboard.css';
import './styles/today-dashboard.css';
import './styles/calendar.css';
import './styles/task-manager.css';
import './styles/task-templates.css';
import './styles/expenses.css';
import './styles/analytics.css';
import './styles/roster.css';
import './styles/settings.css';
import './styles/horse-profile.css';
import './styles/toast.css';
import './styles/rtl.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('stableos-welcome-seen');
  });
  const { t } = useTranslation();
  const { isAuthenticated, userProfile, logout, refreshAuth } = useAuth();

  async function handleLoginSuccess() {
    await refreshAuth();
  }

  async function handleRegisterSuccess() {
    setShowRegister(false);
    await refreshAuth();
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  const farmId = userProfile?.farm_id || import.meta.env.VITE_FARM_ID || 'demo-farm';
  const userId = userProfile?.id;

  return (
    <div className="app">
      <header className="app-header">
        <img src="/assets/logo.png" alt="StableOS Logo" className="app-header-logo" />
        <div className="app-header-content">
          <h1>{t('appTitle')}</h1>
          <p className="subtitle">{t('appSubtitle')}</p>
        </div>
        <div className="app-header-user">
          <span>{userProfile?.name}</span>
          <button className="logout-button" onClick={logout} title={t('auth.logout')}>
            ↪
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard farmId={farmId} />
        )}
        {activeTab === 'today' && (
          <TodayDashboard farmId={farmId} currentUserId={userId} />
        )}
        {activeTab === 'calendar' && (
          <Calendar farmId={farmId} />
        )}
        {activeTab === 'tasks' && (
          <TaskManager farmId={farmId} currentUserId={userId} />
        )}
        {activeTab === 'templates' && (
          <TaskTemplates farmId={farmId} />
        )}
        {activeTab === 'expenses' && (
          <Expenses farmId={farmId} />
        )}
        {activeTab === 'analytics' && (
          <Analytics farmId={farmId} />
        )}
        {activeTab === 'horses' && (
          <HorseRoster farmId={farmId} />
        )}
        {activeTab === 'people' && (
          <PeopleRoster farmId={farmId} />
        )}
        {activeTab === 'settings' && (
          <Settings farmId={farmId} />
        )}
      </main>

      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">{t('nav.dashboard')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">{t('nav.today')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <span className="nav-icon">📆</span>
          <span className="nav-label">{t('nav.calendar')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <span className="nav-icon">✓</span>
          <span className="nav-label">{t('nav.tasks')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <span className="nav-icon">≡</span>
          <span className="nav-label">{t('nav.templates')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <span className="nav-icon">$</span>
          <span className="nav-label">{t('nav.expenses')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-label">{t('nav.analytics')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'horses' ? 'active' : ''}`}
          onClick={() => setActiveTab('horses')}
        >
          <span className="nav-icon">🐎</span>
          <span className="nav-label">{t('nav.horses')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'people' ? 'active' : ''}`}
          onClick={() => setActiveTab('people')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">{t('nav.people')}</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="nav-icon">⚙</span>
          <span className="nav-label">{t('nav.settings')}</span>
        </button>
      </nav>

      {showWelcome && (
        <div className="modal-overlay" onClick={() => {
          setShowWelcome(false);
          localStorage.setItem('stableos-welcome-seen', 'true');
        }}>
          <div className="modal welcome-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ברוכים הבאים ל-StableOS</h2>
              <button
                className="close-button"
                onClick={() => {
                  setShowWelcome(false);
                  localStorage.setItem('stableos-welcome-seen', 'true');
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-content welcome-content">
              <p>
                <strong>StableOS</strong> היא פלטפורמה מנהלת מקיפה לחוות סוסים המאפשרת לך:
              </p>
              <ul>
                <li>🐎 ניהול מידע מפורט על כל הסוסים שלך</li>
                <li>✓ תזמון וניהול משימות יומיומיות ותחזוקה</li>
                <li>👥 ניהול צוות וחלוקת משימות</li>
                <li>📊 מעקב כלכלי ודוחות ניתוח</li>
                <li>📅 תכנון אירועים וקביעות</li>
              </ul>
              <hr />
              <h4>איך להתחיל:</h4>
              <ol>
                <li>עברו לכרטיסייה "סוסים" להוסיף את הסוסים שלכם</li>
                <li>הגדרו את צוות החוות בכרטיסייה "צוות"</li>
                <li>צרו משימות וקבעו לוחות זמנים</li>
                <li>עקבו אחרי כלכלת החוות בדוחות</li>
              </ol>
              <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
                כדי להבין טוב יותר את כל התכונות, בדקו את כל הכרטיסיות בתפריט הסייד.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="submit-button"
                onClick={() => {
                  setShowWelcome(false);
                  localStorage.setItem('stableos-welcome-seen', 'true');
                }}
              >
                הבנתי, בואו נתחיל!
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
