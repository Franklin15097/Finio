import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Balance from './pages/Balance';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/auth" />;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route path="/" element={<PrivateRoute><Balance /></PrivateRoute>} />
        <Route path="/income" element={<PrivateRoute><Income /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
        <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
