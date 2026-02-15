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

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Wallet, label: 'Баланс', gradient: 'from-[#7c3aed] to-[#a855f7]' },
    { path: '/income', icon: TrendingUp, label: 'Доходы', gradient: 'from-[#a855f7] to-[#c084fc]' },
    { path: '/expenses', icon: TrendingDown, label: 'Расходы', gradient: 'from-[#c084fc] to-[#a855f7]' },
    { path: '/accounts', icon: Wallet, label: 'Счета', gradient: 'from-[#7c3aed] to-[#c084fc]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] flex flex-col">
      {/* Animated purple background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#7c3aed] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#c084fc] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="h-20 px-8 flex items-center justify-between">
          <button 
            onClick={() => {
              navigate('/');
              window.location.reload();
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/logo3.png" 
              alt="Finio" 
              className="h-14 w-auto drop-shadow-lg"
            />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-sm text-white/80 font-medium">
              Finance Studio
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-20 bottom-0 w-72 backdrop-blur-xl bg-white/10 border-r border-white/20 p-6 flex flex-col">
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full group relative overflow-hidden rounded-3xl transition-all duration-300 ${
                  isActive ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-100`}></div>
                )}
                <div className={`relative flex items-center gap-3 px-5 py-4 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
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
          <div className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-3xl">
            <div className="w-10 h-10 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-white/10 hover:bg-white/20 text-white rounded-3xl transition-all duration-300 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 mt-20 p-8 relative z-10 flex-1">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="ml-72 relative z-10 backdrop-blur-xl bg-white/5 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo3.png" 
                alt="Finio" 
                className="h-8 w-auto opacity-80"
              />
              <div>
                <p className="text-white font-semibold text-sm">Finio</p>
                <p className="text-xs text-white/60">© 2026 Все права защищены</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-white/60">
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
