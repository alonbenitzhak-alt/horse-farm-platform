import { useState } from 'react';
import TodayDashboard from './pages/TodayDashboard';
import Calendar from './pages/Calendar';
import TaskManager from './pages/TaskManager';
import HorseRoster from './pages/HorseRoster';
import PeopleRoster from './pages/PeopleRoster';
import Settings from './pages/Settings';
import Toast from './components/Toast';
import { LanguageProvider } from './context/LanguageContext';
import { useTranslation } from './hooks/useTranslation';
import './App.css';
import './styles/today-dashboard.css';
import './styles/calendar.css';
import './styles/task-manager.css';
import './styles/roster.css';
import './styles/settings.css';
import './styles/toast.css';
import './styles/rtl.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('today');
  const { t } = useTranslation();

  const farmId = import.meta.env.VITE_FARM_ID || 'demo-farm';
  const userId = import.meta.env.VITE_USER_ID;

  return (
    <div className="app">
      <header className="app-header">
        <img src="/assets/logo.png" alt="StableOS Logo" className="app-header-logo" />
        <div className="app-header-content">
          <h1>{t('appTitle')}</h1>
          <p className="subtitle">{t('appSubtitle')}</p>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'today' && (
          <TodayDashboard farmId={farmId} currentUserId={userId} />
        )}
        {activeTab === 'calendar' && (
          <Calendar farmId={farmId} />
        )}
        {activeTab === 'tasks' && (
          <TaskManager farmId={farmId} currentUserId={userId} />
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
      <AppContent />
    </LanguageProvider>
  );
}
