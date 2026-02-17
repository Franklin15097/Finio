import { ReactNode, useState } from 'react';
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
  Moon,
  BarChart3,
  Menu,
  X,
  Home,
  Settings,
  FileText,
  Bell,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import TelegramLayout from './TelegramLayout';
import { isTelegramWebApp } from '../utils/telegram';
import WebSocketStatus from './WebSocketStatus';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use Telegram layout if in Telegram Mini App
  if (isTelegramWebApp()) {
    return <TelegramLayout>{children}</TelegramLayout>;
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Главная', gradient: 'from-purple-500 to-purple-600' },
    { path: '/transactions', icon: FileText, label: 'Транзакции', gradient: 'from-blue-500 to-cyan-600' },
    { path: '/income', icon: TrendingUp, label: 'Доходы', gradient: 'from-green-500 to-emerald-600' },
    { path: '/expenses', icon: TrendingDown, label: 'Расходы', gradient: 'from-red-500 to-pink-600' },
    { path: '/accounts', icon: Wallet, label: 'Счета', gradient: 'from-yellow-500 to-orange-600' },
    { path: '/analytics', icon: BarChart3, label: 'Аналитика', gradient: 'from-purple-500 to-fuchsia-600' },
    { path: '/settings', icon: Settings, label: 'Настройки', gradient: 'from-gray-500 to-gray-600' },
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

      {/* WebSocket Status Indicator */}
      <WebSocketStatus position="top-right" autoHide={true} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/95 border-b border-border shadow-lg">
        <div className="h-16 px-4 md:px-6 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg glass-card hover:bg-card/90 text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300"
          >
            <img 
              src="/logo.png" 
              alt="Finio" 
              className="h-10 md:h-12 w-auto drop-shadow-2xl"
            />
            <div className="hidden md:block">
              <div className="text-sm text-foreground font-semibold">Finance Studio</div>
              <div className="text-xs text-muted-foreground">v2.0.0</div>
            </div>
          </button>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle variant="icon" />
            <div className="hidden md:flex items-center gap-2 px-3 py-2 glass-card rounded-xl">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-foreground font-semibold">{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border shadow-lg">
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white`
                        : 'glass-card hover:bg-card/90 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })}
              
              {/* User Info in Mobile Menu */}
              <div className="pt-4 mt-4 border-t border-border">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-semibold text-sm truncate">{user?.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 mt-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-xl transition-colors font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 backdrop-blur-xl bg-card/95 border-r border-border p-4 flex flex-col shadow-xl">
        <nav className="space-y-2 flex-1">
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
                <div className={`relative flex items-center gap-3 px-4 py-3.5 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-muted-foreground hover:text-foreground glass-card hover:bg-card/90'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="mt-auto space-y-2 pt-4 border-t border-border">
          <div className="relative overflow-hidden flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="relative w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-foreground font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <ThemeToggle variant="button" showLabel={false} />
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-300 font-semibold text-sm border border-red-500/20 backdrop-blur-sm hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 mt-16 p-4 md:p-6 relative z-10 flex-1 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="md:ml-64 relative z-0 backdrop-blur-xl bg-card/95 border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Finio" 
                className="h-6 w-auto opacity-80"
              />
              <div>
                <p className="text-foreground font-semibold text-sm">Finio v2.0.0</p>
                <p className="text-xs text-muted-foreground">© 2026 Все права защищены</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <a href="/terms.html" target="_blank" className="hover:text-foreground transition-colors">Соглашение</a>
              <a href="/privacy.html" target="_blank" className="hover:text-foreground transition-colors">Конфиденциальность</a>
              <a href="mailto:support@studiofinance.ru" className="hover:text-foreground transition-colors">Поддержка</a>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
                Real-time sync
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
