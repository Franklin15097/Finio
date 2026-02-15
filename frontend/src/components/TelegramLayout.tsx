import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Settings,
  LayoutDashboard
} from 'lucide-react';

interface TelegramLayoutProps {
  children: ReactNode;
}

export default function TelegramLayout({ children }: TelegramLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Wallet, label: 'Баланс' },
    { path: '/income', icon: TrendingUp, label: 'Доходы' },
    { path: '/expenses', icon: TrendingDown, label: 'Расходы' },
    { path: '/accounts', icon: LayoutDashboard, label: 'Счета' },
    { path: '/settings', icon: Settings, label: 'Ещё' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 animate-fade-in">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-purple-500/20 safe-area-bottom z-50 shadow-lg shadow-purple-900/50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${
                  isActive 
                    ? 'text-purple-400 bg-purple-500/10' 
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Legal Links */}
        <div className="px-4 py-2 border-t border-purple-500/10 bg-slate-900/50">
          <div className="flex items-center justify-center gap-3 text-[9px] text-slate-400">
            <a href="/terms.html" target="_blank" className="hover:text-purple-300 transition-colors">Соглашение</a>
            <span>•</span>
            <a href="/privacy.html" target="_blank" className="hover:text-purple-300 transition-colors">Конфиденциальность</a>
            <span>•</span>
            <span>© 2026 Finio</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
