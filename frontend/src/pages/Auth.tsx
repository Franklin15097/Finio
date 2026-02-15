import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';

// Telegram Login Widget types
declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export default function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isTelegram, loginWithTelegram } = useAuth();

  // Auto-login ONLY for Telegram Mini App users (not for web)
  useEffect(() => {
    if (isTelegram) {
      console.log('Detected Telegram Mini App, auto-login...');
      handleTelegramLogin();
    }
  }, [isTelegram]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Finio
          </h1>
          <p className="text-gray-400">Ваш личный финансовый помощник</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Вход через Telegram
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
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
              <p className="text-gray-300 mb-6 text-center">
                Нажмите кнопку для входа через Telegram
              </p>

              {/* Telegram Login Button */}
              <a
                href="https://t.me/FinanceStudio_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
              >
                <Send className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-lg">Войти через Telegram</span>
              </a>

              <p className="mt-6 text-center text-sm text-gray-400">
                Безопасный вход без паролей
              </p>
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
