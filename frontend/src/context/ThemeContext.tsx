import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, getTheme } from '../styles/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  setTheme: (name: string) => void;
  availableThemes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<string>(() => {
    return localStorage.getItem('theme') || 'ocean';
  });

  const theme = getTheme(themeName);

  useEffect(() => {
    localStorage.setItem('theme', themeName);
    
    // Применяем CSS переменные
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    Object.entries(theme.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value);
    });
  }, [theme, themeName]);

  const setTheme = (name: string) => {
    if (themes[name]) {
      setThemeName(name);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, availableThemes: themes }}>
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
