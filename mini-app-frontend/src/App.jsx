import { useEffect, useState } from 'react';
import './styles/main.css';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { api } from './utils/api';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#0F0F14');
      tg.setBackgroundColor('#0F0F14');
      
      const userData = tg.initDataUnsafe?.user;
      setUser(userData);
      
      // Mock auth for development
      if (userData) {
        api.setToken('mock-token-' + userData.id);
      }
    }
  }, []);

  function handleTransactionSuccess() {
    setView('dashboard');
    setRefreshKey(prev => prev + 1);
  }

  return (
    <div className="app">
      <div className="header">
        <div className="logo">💎</div>
        <h1>Finio</h1>
        <p className="subtitle">Умный контроль финансов</p>
      </div>

      {user && (
        <div className="welcome-card">
          <div className="avatar">{user.first_name?.[0] || '👤'}</div>
          <h2>Привет, {user.first_name}!</h2>
        </div>
      )}

      <div className="nav-tabs">
        <button 
          className={view === 'dashboard' ? 'active' : ''} 
          onClick={() => setView('dashboard')}
        >
          📊 Дашборд
        </button>
        <button 
          className={view === 'add' ? 'active' : ''} 
          onClick={() => setView('add')}
        >
          ➕ Добавить
        </button>
      </div>

      {view === 'dashboard' && <Dashboard key={refreshKey} />}
      {view === 'add' && <TransactionForm onSuccess={handleTransactionSuccess} />}
    </div>
  );
}

export default App;
