import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      setUser(tg.initDataUnsafe?.user);
    }
  }, []);

  return (
    <div className="app">
      <h1>Studio Finance</h1>
      <p>Mini App</p>
      {user && (
        <div className="user-info">
          <p>Привет, {user.first_name}!</p>
        </div>
      )}
    </div>
  );
}

export default App;
