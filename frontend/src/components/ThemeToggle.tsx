import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'button';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  showLabel = false
}) => {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg glass-card hover:bg-card/90 text-foreground transition-all"
        aria-label={`Переключить тему, текущая: ${isDark ? 'тёмная' : 'светлая'}`}
        title={`Текущая тема: ${isDark ? 'Тёмная' : 'Светлая'}`}
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <div className="flex items-center gap-2">
        {showLabel && (
          <span className="text-sm text-muted-foreground">
            Тема: {isDark ? 'Тёмная' : 'Светлая'}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-lg glass-card hover:bg-card/90 text-foreground text-sm font-medium transition-all flex items-center gap-2"
        >
          {isDark ? (
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

  return null;
};

export default ThemeToggle;