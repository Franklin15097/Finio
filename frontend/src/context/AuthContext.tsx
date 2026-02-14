import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { isTelegramWebApp, getTelegramInitData } from '../utils/telegram';

interface User {
  id: number;
  email: string;
  name: string;
  telegram_id?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
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
    // Try Telegram auth first if in Telegram
    if (isTelegram) {
      try {
        await loginWithTelegram();
        setLoading(false);
        return;
      } catch (error) {
        console.log('Telegram auth failed, trying token auth');
      }
    }

    // Fallback to token auth
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = await api.getMe();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
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
    const data = await api.login(email, password);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } else {
      throw new Error(data.error || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await api.register(email, password, name);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithTelegram, logout, isTelegram }}>
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
