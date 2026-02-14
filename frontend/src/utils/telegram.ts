// Telegram Web App utilities
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          auth_date?: number;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{ id?: string; type?: string; text?: string }>;
        }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
      };
    };
  }
}

export const tg = window.Telegram?.WebApp;

export const isTelegramWebApp = (): boolean => {
  return !!tg;
};

export const getTelegramUser = () => {
  return tg?.initDataUnsafe?.user;
};

export const getTelegramInitData = () => {
  return tg?.initData || '';
};

export const initTelegramApp = () => {
  if (tg) {
    tg.ready();
    tg.expand();
    
    // Apply Telegram theme
    if (tg.themeParams.bg_color) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
    }
    if (tg.themeParams.text_color) {
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
    }
    if (tg.themeParams.button_color) {
      document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
    }
  }
};

export const showBackButton = (onClick: () => void) => {
  if (tg?.BackButton) {
    tg.BackButton.onClick(onClick);
    tg.BackButton.show();
  }
};

export const hideBackButton = () => {
  if (tg?.BackButton) {
    tg.BackButton.hide();
  }
};

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
  if (!tg?.HapticFeedback) return;
  
  if (type === 'success' || type === 'error' || type === 'warning') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
};

export const closeTelegramApp = () => {
  tg?.close();
};
