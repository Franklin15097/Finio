import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  LogOut,
  Sparkles
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/10">
        <div className="h-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <span className="text-white text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Finio</span>
              <p className="text-xs text-gray-400">Финансовый помощник</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-20 bottom-0 w-72 backdrop-blur-xl bg-white/5 border-r border-white/10 p-6">
        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  isActive ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-100`}></div>
                )}
                <div className={`relative flex items-center gap-4 px-6 py-4 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}>
                  <Icon className="w-6 h-6" />
                  <span className="font-semibold text-lg">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-3 px-6 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-2xl transition-all duration-300 font-semibold border border-red-500/30"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-72 mt-20 p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
