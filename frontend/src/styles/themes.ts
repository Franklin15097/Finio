// Цветовые темы для приложения
export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundGradient: string;
    surface: string;
    surfaceGlass: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    income: string;
    expense: string;
  };
  effects: {
    blur: string;
    shadow: string;
    glow: string;
  };
}

export const themes: Record<string, Theme> = {
  ocean: {
    name: 'ocean',
    displayName: '🌊 Ocean Breeze',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#8B5CF6',
      background: '#0F172A',
      backgroundGradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      surface: 'rgba(30, 41, 59, 0.8)',
      surfaceGlass: 'rgba(255, 255, 255, 0.1)',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px 0 rgba(14, 165, 233, 0.2)',
      glow: '0 0 20px rgba(14, 165, 233, 0.5)',
    },
  },
  sunset: {
    name: 'sunset',
    displayName: '🌅 Sunset Glow',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      accent: '#EC4899',
      background: '#1C1917',
      backgroundGradient: 'linear-gradient(135deg, #7C2D12 0%, #1C1917 100%)',
      surface: 'rgba(41, 37, 36, 0.8)',
      surfaceGlass: 'rgba(255, 255, 255, 0.1)',
      text: '#FAFAF9',
      textSecondary: '#A8A29E',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#F59E0B',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px 0 rgba(245, 158, 11, 0.2)',
      glow: '0 0 20px rgba(245, 158, 11, 0.5)',
    },
  },
  forest: {
    name: 'forest',
    displayName: '🌲 Forest Green',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#14B8A6',
      background: '#1F2937',
      backgroundGradient: 'linear-gradient(135deg, #064E3B 0%, #1F2937 100%)',
      surface: 'rgba(31, 41, 55, 0.8)',
      surfaceGlass: 'rgba(255, 255, 255, 0.1)',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#EF4444',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px 0 rgba(16, 185, 129, 0.2)',
      glow: '0 0 20px rgba(16, 185, 129, 0.5)',
    },
  },
  midnight: {
    name: 'midnight',
    displayName: '🌙 Midnight Purple',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#EC4899',
      background: '#0F172A',
      backgroundGradient: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
      surface: 'rgba(30, 27, 75, 0.8)',
      surfaceGlass: 'rgba(255, 255, 255, 0.1)',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#A78BFA',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px 0 rgba(139, 92, 246, 0.2)',
      glow: '0 0 20px rgba(139, 92, 246, 0.5)',
    },
  },
  cherry: {
    name: 'cherry',
    displayName: '🌸 Cherry Blossom',
    colors: {
      primary: '#F472B6',
      secondary: '#FB7185',
      accent: '#FCA5A5',
      background: '#1F2937',
      backgroundGradient: 'linear-gradient(135deg, #500724 0%, #1F2937 100%)',
      surface: 'rgba(80, 7, 36, 0.8)',
      surfaceGlass: 'rgba(255, 255, 255, 0.1)',
      text: '#FDF2F8',
      textSecondary: '#F9A8D4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      income: '#10B981',
      expense: '#FB7185',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px 0 rgba(244, 114, 182, 0.2)',
      glow: '0 0 20px rgba(244, 114, 182, 0.5)',
    },
  },
};

export const getTheme = (themeName: string): Theme => {
  return themes[themeName] || themes.ocean;
};
