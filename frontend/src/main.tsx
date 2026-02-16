import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './components/animations.css';
import { ThemeProvider } from './context/ThemeContext';
import { initTelegramApp, isTelegramWebApp } from './utils/telegram';

// Initialize Telegram Web App
initTelegramApp();

// Add telegram-app class to body if in Telegram
if (isTelegramWebApp()) {
  document.body.classList.add('telegram-app');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
