import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, getTheme } from '../styles/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  setTheme: (name: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
  availableThemes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<string>(() => {
    return localStorage.getItem('theme') || 'ocean';
  });
  
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('isDark') !== 'false';
  });

  const theme = getTheme(themeName);

  useEffect(() => {
    localStorage.setItem('theme', themeName);
    localStorage.setItem('isDark', isDark.toString());
    
    // Применяем CSS переменные
    const root = document.documentElement;
    
    // Toggle dark/light class
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    Object.entries(theme.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value);
    });
  }, [theme, themeName, isDark]);

  const setTheme = (name: string) => {
    if (themes[name]) {
      setThemeName(name);
    }
  };
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, toggleTheme, isDark, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
