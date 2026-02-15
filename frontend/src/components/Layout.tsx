import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  LogOut,
  User,
  Sun,
  Moon
} from 'lucide-react';
import TelegramLayout from './TelegramLayout';
import { isTelegramWebApp } from '../utils/telegram';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Animated purple background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-300">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:opacity-20 light:opacity-10"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:opacity-20 light:opacity-10"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:opacity-20 light:opacity-10"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000 dark:opacity-20 light:opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-8000 dark:opacity-20 light:opacity-10"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/80 border-b border-border shadow-lg">
        <div className="h-14 px-4 flex items-center justify-between">
          <button 
            onClick={() => {
              navigate('/');
              window.location.reload();
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-all duration-300"
          >
            <img 
              src="/logo.png" 
              alt="Finio" 
              className="h-10 w-auto drop-shadow-2xl"
            />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-xs text-muted-foreground font-medium">
              Finance Studio
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 w-52 backdrop-blur-xl bg-card/80 border-r border-border p-3 flex flex-col shadow-xl">
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  isActive ? 'scale-105 shadow-lg shadow-primary/50' : 'hover:scale-105'
                }`}
              >
                {isActive && (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-100`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </>
                )}
                <div className={`relative flex items-center gap-2.5 px-3 py-2.5 ${
                  isActive 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary'
                }`}>
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-xs">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="mt-auto space-y-1.5 pt-3 border-t border-border">
          <div className="relative overflow-hidden flex items-center gap-2.5 px-3 py-2.5 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="relative w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-foreground font-medium text-xs truncate">{user?.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive hover:text-destructive-foreground rounded-xl transition-all duration-300 font-medium text-xs border border-destructive/20 backdrop-blur-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-52 mt-14 p-4 relative z-10 flex-1 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="ml-52 relative z-10 backdrop-blur-xl bg-card/80 border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Finio" 
                className="h-5 w-auto opacity-80"
              />
              <div>
                <p className="text-foreground font-semibold text-xs">Finio</p>
                <p className="text-[9px] text-muted-foreground">© 2026 Все права защищены</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
              <a href="/terms.html" target="_blank" className="hover:text-foreground transition-colors">Соглашение</a>
              <a href="/privacy.html" target="_blank" className="hover:text-foreground transition-colors">Конфиденциальность</a>
              <a href="mailto:support@studiofinance.ru" className="hover:text-foreground transition-colors">Поддержка</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
