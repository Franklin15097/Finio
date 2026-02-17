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
    { path: '/telegram/balance', icon: Wallet, label: 'Баланс' },
    { path: '/telegram/income', icon: TrendingUp, label: 'Доходы' },
    { path: '/telegram/expenses', icon: TrendingDown, label: 'Расходы' },
    { path: '/telegram/accounts', icon: LayoutDashboard, label: 'Счета' },
    { path: '/telegram/settings', icon: Settings, label: 'Ещё' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-32">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-6000"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 animate-fade-in pb-4 px-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/98 backdrop-blur-xl border-t border-white/10 safe-area-bottom z-50 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[68px] ${
                  isActive 
                    ? 'text-purple-300 bg-purple-500/20 scale-110 shadow-lg shadow-purple-500/30' 
                    : 'text-slate-400 hover:text-purple-300 hover:bg-purple-500/10'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Legal Links */}
        <div className="px-4 py-2.5 border-t border-white/5 bg-black/70">
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500">
            <a href="/terms.html" target="_blank" className="hover:text-purple-300 transition-colors font-medium">Соглашение</a>
            <span className="text-slate-700">•</span>
            <a href="/privacy.html" target="_blank" className="hover:text-purple-300 transition-colors font-medium">Конфиденциальность</a>
            <span className="text-slate-700">•</span>
            <span className="font-semibold">© 2026 Finio</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
