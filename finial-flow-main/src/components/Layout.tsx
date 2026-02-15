import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, ArrowUpRight, ArrowDownRight, Landmark, SlidersHorizontal, 
  Sun, Moon 
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Обзор' },
  { to: '/income', icon: ArrowUpRight, label: 'Доходы' },
  { to: '/expenses', icon: ArrowDownRight, label: 'Расходы' },
  { to: '/accounts', icon: Landmark, label: 'Счета' },
  { to: '/settings', icon: SlidersHorizontal, label: 'Настройки' },
];

export default function Layout() {
  const { theme, toggle } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/80 backdrop-blur-xl border-b border-border/60 flex items-center px-5 md:px-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Finio" className="h-9 w-9 rounded-xl shadow-sm" />
          <div className="hidden sm:block">
            <span className="font-extrabold text-lg tracking-tight">Finio</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md">
            А
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-[220px] flex-col bg-card/60 backdrop-blur-xl border-r border-border/60 p-4 z-40">
        <nav className="flex flex-col gap-1 flex-1 mt-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border/60 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              А
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Александр</p>
              <p className="text-[11px] text-muted-foreground truncate">alex@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pt-16 md:pl-[220px] pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto p-5 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/60 flex items-center justify-around px-1 py-2">
        {navItems.map(item => {
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-semibold transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-colors',
                isActive ? 'bg-primary/10' : ''
              )}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
