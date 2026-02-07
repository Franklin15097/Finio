import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import './styles/main.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const token = localStorage.getItem('auth_token');
    const userName = localStorage.getItem('user_name');
    
    if (token && userName) {
      setUser({ name: userName, token });
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('auth_token', userData.token);
    localStorage.setItem('user_name', userData.name);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    setCurrentView('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      case 'login':
        return <LoginForm onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
      case 'register':
        return <RegisterForm onRegister={handleLogin} onBack={() => setCurrentView('landing')} />;
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return <div className="app">{renderCurrentView()}</div>;
}

export default App;
