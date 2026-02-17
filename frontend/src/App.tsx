import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import DashboardImproved from './pages/DashboardImproved';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import TelegramCategories from './pages/telegram/TelegramCategories';
import TelegramAnalytics from './pages/telegram/TelegramAnalytics';
import { Component, ReactNode } from 'react';
import './App.css';

// Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Что-то пошло не так</h1>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || 'Произошла ошибка при загрузке страницы'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? (
    <Layout>
      <div key={location.pathname} className="animate-fade-in">
        {children}
      </div>
    </Layout>
  ) : <Navigate to="/auth" />;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
      <Route path="/" element={<PrivateRoute><DashboardImproved /></PrivateRoute>} />
      <Route path="/income" element={<PrivateRoute><Income /></PrivateRoute>} />
      <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
      <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/telegram/categories" element={<PrivateRoute><TelegramCategories /></PrivateRoute>} />
      <Route path="/telegram/analytics" element={<PrivateRoute><TelegramAnalytics /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
