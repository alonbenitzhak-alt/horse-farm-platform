import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TodayDashboard from './pages/TodayDashboard';
import Calendar from './pages/Calendar';
import TaskManager from './pages/TaskManager';
import TaskTemplates from './pages/TaskTemplates';
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
import './styles/roster.css';
import './styles/settings.css';
import './styles/horse-profile.css';
import './styles/toast.css';
import './styles/rtl.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated, userProfile, logout } = useAuth();

  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onSuccess={() => setShowRegister(false)}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onSuccess={() => {}}
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
            🚪
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
          title={t('nav.dashboard')}
        >
          📊
        </button>
        <button
          className={`nav-button ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
          title={t('nav.today')}
        >
          📅
        </button>
        <button
          className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
          title={t('nav.calendar')}
        >
          📆
        </button>
        <button
          className={`nav-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
          title={t('nav.tasks')}
        >
          ✅
        </button>
        <button
          className={`nav-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
          title={t('nav.templates')}
        >
          📋
        </button>
        <button
          className={`nav-button ${activeTab === 'horses' ? 'active' : ''}`}
          onClick={() => setActiveTab('horses')}
          title={t('nav.horses')}
        >
          🐎
        </button>
        <button
          className={`nav-button ${activeTab === 'people' ? 'active' : ''}`}
          onClick={() => setActiveTab('people')}
          title={t('nav.people')}
        >
          👥
        </button>
        <button
          className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          title={t('nav.settings')}
        >
          ⚙️
        </button>
      </nav>

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
