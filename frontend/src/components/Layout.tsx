import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  LogOut,
  Sparkles,
  User
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Wallet, label: 'Баланс', gradient: 'from-blue-500 to-indigo-600' },
    { path: '/income', icon: TrendingUp, label: 'Доходы', gradient: 'from-green-500 to-emerald-600' },
    { path: '/expenses', icon: TrendingDown, label: 'Расходы', gradient: 'from-red-500 to-pink-600' },
    { path: '/accounts', icon: Wallet, label: 'Счета', gradient: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="h-16 px-8 flex items-center justify-between">
          <button 
            onClick={() => {
              navigate('/');
              window.location.reload();
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-md opacity-75"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-white text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Finio</span>
          </button>

          <div className="text-xs text-gray-400">
            Финансовый помощник
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 p-6 flex flex-col">
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  isActive ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-100`}></div>
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 font-medium border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-8 relative z-10 flex-1">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="ml-64 relative z-10 backdrop-blur-xl bg-white/5 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Finio</p>
                <p className="text-xs text-gray-400">© 2026 Все права защищены</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-gray-400">
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
