import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';
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

  // Auto-login for Telegram Mini App users
  useEffect(() => {
    if (isTelegram) {
      handleTelegramLogin();
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
          
          if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('Token saved, reloading...');
            window.location.reload();
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
        setError('Не удалось загрузить виджет Telegram');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Вход через Telegram...</h2>
          <p className="text-gray-400">Подождите немного</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-float">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-75"></div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Finio
          </h1>
          <p className="text-gray-400">Ваш личный финансовый помощник</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z"/>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Войти через Telegram
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Авторизация...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-6">
                Используйте Telegram для быстрого и безопасного входа
              </p>

              {/* Telegram Login Widget Container */}
              <div id="telegram-login-button-container" className="flex justify-center mb-6 min-h-[50px]">
                {!widgetLoaded && !error && (
                  <div className="text-gray-400">Загрузка виджета...</div>
                )}
              </div>

              {widgetLoaded && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border border-blue-500/30 rounded-xl">
                  <p className="text-sm text-gray-300">
                    💡 Нажмите кнопку выше для входа через Telegram
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass-card rounded-2xl p-4">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-gray-400 text-xs">Доходы</p>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-gray-400 text-xs">Аналитика</p>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-gray-400 text-xs">Цели</p>
          </div>
        </div>
      </div>
    </div>
  );
}
