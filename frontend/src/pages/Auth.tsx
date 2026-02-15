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
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-purple-100">Авторизация...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated purple blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <img 
              src="/logo.png" 
              alt="Finio" 
              className="w-48 h-48 drop-shadow-2xl mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Finio</h1>
          <p className="text-purple-200 text-lg">Finance Studio</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Вход через Telegram
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-purple-100">Авторизация...</p>
            </div>
          ) : (
            <>
              <p className="text-purple-100 mb-6 text-center">
                Нажмите кнопку для входа через Telegram
              </p>

              {/* Telegram Login Button */}
              <a
                href="https://t.me/FinanceStudio_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white hover:bg-purple-50 text-purple-700 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg font-semibold"
              >
                <Send className="w-6 h-6" />
                <span className="text-lg">Войти через Telegram</span>
              </a>

              <p className="mt-6 text-center text-sm text-purple-200">
                Безопасный вход без паролей
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-4 text-center backdrop-blur-sm bg-white/10 border border-white/20">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-purple-100 text-xs font-medium">Доходы</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center backdrop-blur-sm bg-white/10 border border-white/20">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-purple-100 text-xs font-medium">Аналитика</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center backdrop-blur-sm bg-white/10 border border-white/20">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-purple-100 text-xs font-medium">Цели</p>
          </div>
        </div>
      </div>
    </div>
  );
}
