import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Home, BarChart3, Plus, CreditCard, Settings } from 'lucide-react';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Главная', path: '/dashboard' },
  { icon: BarChart3, label: 'Аналитика', path: '/analytics' },
  { icon: Plus, label: 'Добавить', path: '/add', isCenter: true },
  { icon: CreditCard, label: 'Счета', path: '/accounts' },
  { icon: Settings, label: 'Настройки', path: '/settings' },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: theme.colors.surfaceGlass,
        backdropFilter: theme.effects.blur,
        WebkitBackdropFilter: theme.effects.blur,
        borderTop: `1px solid ${theme.colors.surfaceGlass}`,
        boxShadow: `0 -4px 20px ${theme.colors.primary}20`,
      }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -mt-8 transition-transform active:scale-95 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow: `0 8px 30px ${theme.colors.primary}60`,
                }}
              >
                <Icon size={28} color="#FFFFFF" />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all active:scale-95"
              style={{
                color: active ? theme.colors.primary : theme.colors.textSecondary,
                background: active ? `${theme.colors.primary}20` : 'transparent',
              }}
            >
              <Icon 
                size={24} 
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
