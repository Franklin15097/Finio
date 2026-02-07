import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#1a1a2e');
      tg.setBackgroundColor('#16213e');
      
      setUser(tg.initDataUnsafe?.user);
    }
  }, []);

  return (
    <div className="app">
      <div className="header">
        <div className="logo">💰</div>
        <h1>Finio</h1>
        <p className="subtitle">Финансовый помощник</p>
      </div>

      {user && (
        <div className="welcome-card">
          <div className="avatar">{user.first_name?.[0] || '👤'}</div>
          <h2>Привет, {user.first_name}!</h2>
          <p>Добро пожаловать в Finio</p>
        </div>
      )}

      <div className="features">
        <div className="feature-card">
          <div className="icon">📊</div>
          <h3>Аналитика</h3>
          <p>Отслеживайте доходы и расходы</p>
        </div>
        
        <div className="feature-card">
          <div className="icon">💳</div>
          <h3>Счета</h3>
          <p>Управляйте финансами</p>
        </div>
        
        <div className="feature-card">
          <div className="icon">🎯</div>
          <h3>Цели</h3>
          <p>Планируйте накопления</p>
        </div>
      </div>

      <button className="main-button">
        Начать работу
      </button>
    </div>
  );
}

export default App;
