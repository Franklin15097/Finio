import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Settings,
  BarChart3
} from 'lucide-react';

interface TelegramLayoutProps {
  children: ReactNode;
}

export default function TelegramLayout({ children }: TelegramLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Главная' },
    { path: '/income', icon: TrendingUp, label: 'Доходы' },
    { path: '/expenses', icon: TrendingDown, label: 'Расходы' },
    { path: '/accounts', icon: Wallet, label: 'Счета' },
    { path: '/settings', icon: Settings, label: 'Ещё' },
  ];

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color,#ffffff)] pb-20">
      {/* Main Content */}
      <main className="animate-fade-in">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--tg-theme-secondary-bg-color,#ffffff)] border-t border-gray-200 safe-area-bottom z-50">
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
                    ? 'text-[var(--tg-theme-button-color,#3390ec)]' 
                    : 'text-[var(--tg-theme-hint-color,#999999)]'
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
