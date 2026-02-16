import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'dropdown';
  position?: 'header' | 'sidebar' | 'floating';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  position = 'header',
  showLabel = false
}) => {
  const { theme, toggleTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Светлая', icon: Sun, description: 'Светлая тема для дневного использования' },
    { id: 'dark', label: 'Тёмная', icon: Moon, description: 'Тёмная тема для ночного использования' },
    { id: 'system', label: 'Системная', icon: Monitor, description: 'Следовать настройкам системы' }
  ];

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      localStorage.setItem('finio-theme', systemTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemTheme);
    } else {
      toggleTheme();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'header':
        return '';
      case 'sidebar':
        return 'w-full';
      case 'floating':
        return 'fixed bottom-4 right-4 z-50';
      default:
        return '';
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ${getPositionClasses()}`}
        aria-label={`Переключить тему, текущая: ${theme === 'dark' ? 'тёмная' : 'светлая'}`}
        title={`Текущая тема: ${theme === 'dark' ? 'Тёмная' : 'Светлая'}`}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`flex items-center gap-2 ${getPositionClasses()}`}>
        {showLabel && (
          <span className="text-sm text-gray-300">
            Тема: {theme === 'dark' ? 'Тёмная' : 'Светлая'}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4" />
              Светлая
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              Тёмная
            </>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'dropdown') {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className={`relative ${getPositionClasses()}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span>{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = themeOption.id === theme || 
                  (themeOption.id === 'system' && !['light', 'dark'].includes(theme));

                return (
                  <button
                    key={themeOption.id}
                    onClick={() => {
                      handleThemeChange(themeOption.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">{themeOption.label}</div>
                      <div className="text-xs text-gray-400">{themeOption.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Хук для использования темы в компонентах
export const useThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    themeIcon: theme === 'dark' ? Sun : Moon,
    themeLabel: theme === 'dark' ? 'Тёмная' : 'Светлая',
    nextTheme: theme === 'dark' ? 'light' : 'dark',
    nextThemeLabel: theme === 'dark' ? 'Светлая' : 'Тёмная'
  };
};

export default ThemeToggle;