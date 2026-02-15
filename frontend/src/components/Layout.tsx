import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  LogOut,
  User
} from 'lucide-react';
import TelegramLayout from './TelegramLayout';
import { isTelegramWebApp } from '../utils/telegram';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Use Telegram layout if in Telegram Mini App
  if (isTelegramWebApp()) {
    return <TelegramLayout>{children}</TelegramLayout>;
  }

  const navItems = [
    { path: '/', icon: Wallet, label: 'Баланс', gradient: 'from-purple-500 to-purple-600' },
    { path: '/income', icon: TrendingUp, label: 'Доходы', gradient: 'from-purple-600 to-purple-700' },
    { path: '/expenses', icon: TrendingDown, label: 'Расходы', gradient: 'from-purple-700 to-purple-800' },
    { path: '/accounts', icon: Wallet, label: 'Счета', gradient: 'from-purple-500 to-fuchsia-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col animate-gradient">
      {/* Animated purple background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-8000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-purple-900/80 border-b border-purple-500/20 shadow-lg shadow-purple-900/50">
        <div className="h-16 px-6 flex items-center justify-between">
          <button 
            onClick={() => {
              navigate('/');
              window.location.reload();
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 hover:scale-105"
          >
            <img 
              src="/logo.png" 
              alt="Finio" 
              className="h-12 w-auto drop-shadow-2xl"
            />
          </button>

          <div className="text-xs text-purple-200/70 font-medium">
            Finance Studio
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-60 backdrop-blur-xl bg-gradient-to-b from-purple-900/80 via-purple-800/80 to-purple-900/80 border-r border-purple-500/20 p-4 flex flex-col shadow-xl shadow-purple-900/50">
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  isActive ? 'scale-105 shadow-lg shadow-purple-500/50' : 'hover:scale-105'
                }`}
              >
                {isActive && (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-100`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </>
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-purple-200/70 hover:text-white bg-white/5 hover:bg-white/10'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="mt-auto space-y-2 pt-4 border-t border-purple-500/20">
          <div className="relative overflow-hidden flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 rounded-2xl border border-purple-400/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="relative w-9 h-9 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-white font-medium text-xs truncate">{user?.name}</p>
              <p className="text-[10px] text-purple-200/60 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-600/30 hover:to-pink-600/30 text-red-200 hover:text-white rounded-2xl transition-all duration-300 font-medium text-sm border border-red-400/20 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-60 mt-16 p-6 relative z-10 flex-1 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="ml-60 relative z-10 backdrop-blur-xl bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-purple-900/80 border-t border-purple-500/20 shadow-lg shadow-purple-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Finio" 
                className="h-6 w-auto opacity-80"
              />
              <div>
                <p className="text-white font-semibold text-xs">Finio</p>
                <p className="text-[10px] text-purple-200/60">© 2026 Все права защищены</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] text-purple-200/60">
              <a href="#" className="hover:text-white transition-colors">О проекте</a>
              <a href="#" className="hover:text-white transition-colors">Поддержка</a>
              <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
