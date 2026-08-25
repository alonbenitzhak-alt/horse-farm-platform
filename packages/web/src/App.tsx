import { useState } from 'react';
import TodayDashboard from './pages/TodayDashboard';
import Calendar from './pages/Calendar';
import TaskManager from './pages/TaskManager';
import './App.css';
import './styles/today-dashboard.css';
import './styles/calendar.css';
import './styles/task-manager.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');

  const farmId = import.meta.env.VITE_FARM_ID || 'demo-farm';
  const userId = import.meta.env.VITE_USER_ID;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐴 StableOS</h1>
        <p className="subtitle">Farm Operations Dashboard</p>
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
          <div className="page">
            <h2>Horses</h2>
            <p>Horse roster coming soon...</p>
          </div>
        )}
        {activeTab === 'people' && (
          <div className="page">
            <h2>People</h2>
            <p>Team roster coming soon...</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="page">
            <h2>Settings</h2>
            <p>Settings coming soon...</p>
          </div>
        )}
      </main>

      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
          title="Today"
        >
          📅
        </button>
        <button
          className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
          title="Calendar"
        >
          📆
        </button>
        <button
          className={`nav-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
          title="Tasks"
        >
          ✅
        </button>
        <button
          className={`nav-button ${activeTab === 'horses' ? 'active' : ''}`}
          onClick={() => setActiveTab('horses')}
          title="Horses"
        >
          🐎
        </button>
        <button
          className={`nav-button ${activeTab === 'people' ? 'active' : ''}`}
          onClick={() => setActiveTab('people')}
          title="People"
        >
          👥
        </button>
        <button
          className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          title="Settings"
        >
          ⚙️
        </button>
      </nav>
    </div>
  );
}
