import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';
import { api } from '../services/api';

// Telegram Login Widget types
declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export default function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const { isTelegram, loginWithTelegram } = useAuth();

  // Auto-login ONLY for Telegram Mini App users (not for web)
  useEffect(() => {
    if (isTelegram) {
      console.log('Detected Telegram Mini App, auto-login...');
      handleTelegramLogin();
    } else {
      console.log('Not in Telegram Mini App, will use widget');
    }
  }, [isTelegram]);

  // Setup Telegram Login Widget callback and load widget
  useEffect(() => {
    if (!isTelegram && !widgetLoaded) {
      console.log('Setting up Telegram widget...');
      
      // Create callback function
      window.onTelegramAuth = async (user) => {
        console.log('Telegram auth callback received:', user);
        setLoading(true);
        setError('');
        try {
          console.log('Calling backend API...');
          const data = await api.loginWithTelegramWidget(user);
          console.log('Backend response:', data);
          
          if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            console.log('Token saved, redirecting to home...');
            // Redirect to home page instead of reload
            window.location.href = '/';
          } else {
            throw new Error(data.error || 'Login failed');
          }
        } catch (err: any) {
          console.error('Telegram widget auth failed:', err);
          setError(err.message || 'Ошибка авторизации через Telegram. Попробуйте еще раз.');
          setLoading(false);
        }
      };

      // Load Telegram Widget script dynamically
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', 'FinanceStudio_bot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '10');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      
      script.onload = () => {
        console.log('Telegram widget script loaded successfully');
        setWidgetLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Telegram widget script');
        setError('Не удалось загрузить виджет Telegram. Проверьте подключение к интернету.');
      };
      
      const container = document.getElementById('telegram-login-button-container');
      if (container) {
        console.log('Appending script to container');
        container.appendChild(script);
      } else {
        console.error('Container not found!');
      }
    }

    return () => {
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [isTelegram, widgetLoaded]);

  const handleTelegramLogin = async () => {
    setLoading(true);
    try {
      await loginWithTelegram();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Telegram authentication failed';
      console.error('Telegram auth failed:', errorMessage);
      setError('Ошибка авторизации через Telegram. Попробуйте еще раз.');
      setLoading(false);
    }
  };

  // Show loading for Telegram Mini App users
  if (isTelegram && loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Авторизация...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Finio</h1>
          <p className="text-gray-400">Финансовый помощник</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Вход через Telegram
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Авторизация...</p>
            </div>
          ) : (
            <>
              {/* Primary: Open Telegram Bot */}
              <a
                href="https://t.me/FinanceStudio_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors duration-200 mb-4"
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">Войти через Telegram</span>
              </a>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800 text-gray-500">или</span>
                </div>
              </div>

              {/* Secondary: Telegram Login Widget */}
              <div id="telegram-login-button-container" className="flex justify-center">
                {!widgetLoaded && !error && (
                  <div className="text-gray-500 text-sm">Загрузка...</div>
                )}
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                Безопасный вход без паролей
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
