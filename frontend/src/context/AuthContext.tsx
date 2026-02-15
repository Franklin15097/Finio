import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { isTelegramWebApp, getTelegramInitData } from '../utils/telegram';

interface User {
  id: number;
  email: string;
  name: string;
  telegram_id?: number;
  telegram_username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithTelegram: () => Promise<void>;
  logout: () => void;
  isTelegram: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isTelegram = isTelegramWebApp();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('=== checkAuth started ===');
    console.log('isTelegram:', isTelegram);
    
    // Check for auth token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth');
    
    if (authToken) {
      console.log('Found auth token in URL, exchanging...');
      try {
        const data = await api.exchangeAuthToken(authToken);
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          setUser(data.user);
          // Remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          console.log('Auth token exchanged successfully');
          return;
        }
      } catch (error) {
        console.error('Failed to exchange auth token:', error);
      }
    }
    
    // Try Telegram auth first if in Telegram
    if (isTelegram) {
      try {
        console.log('Attempting Telegram auth...');
        await loginWithTelegram();
        setLoading(false);
        console.log('Telegram auth successful');
        return;
      } catch (error) {
        console.log('Telegram auth failed, trying token auth:', error);
      }
    }

    // Fallback to token auth
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'exists' : 'not found');
    
    if (token) {
      try {
        console.log('Calling api.getMe()...');
        const data = await api.getMe();
        console.log('api.getMe() response:', data);
        
        if (data.user) {
          console.log('User found:', data.user);
          setUser(data.user);
        } else {
          console.log('No user in response');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token auth failed:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
    console.log('=== checkAuth finished ===');
  };

  const loginWithTelegram = async () => {
    const initData = getTelegramInitData();
    if (!initData) {
      throw new Error('No Telegram init data');
    }

    const data = await api.loginWithTelegram(initData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } else {
      throw new Error(data.error || 'Telegram login failed');
    }
  };

  const login = async (email: string, password: string) => {
    throw new Error('Email/password login is disabled. Use Telegram only.');
  };

  const register = async (email: string, password: string, name: string) => {
    throw new Error('Registration is disabled. Use Telegram only.');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithTelegram, logout, isTelegram }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
