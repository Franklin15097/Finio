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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Авторизация...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-lg mb-6">
            <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
              <path d="M50 10 L50 90 M30 30 L70 30 M30 50 L70 50 M30 70 L70 70" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Finio
          </h1>
          <p className="text-gray-600 text-lg">Finance Studio</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Вход через Telegram
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Авторизация...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6 text-center">
                Нажмите кнопку для входа через Telegram
              </p>

              {/* Telegram Login Button */}
              <a
                href="https://t.me/FinanceStudio_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
              >
                <Send className="w-6 h-6" />
                <span className="font-semibold text-lg">Войти через Telegram</span>
              </a>

              <p className="mt-6 text-center text-sm text-gray-500">
                Безопасный вход без паролей
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-purple-100">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-gray-600 text-xs font-medium">Доходы</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-purple-100">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-gray-600 text-xs font-medium">Аналитика</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-purple-100">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-gray-600 text-xs font-medium">Цели</p>
          </div>
        </div>
      </div>
    </div>
  );
}
