import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Settings,
  Bell,
  User
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/income', icon: TrendingUp, label: 'Доходы' },
    { path: '/expenses', icon: TrendingDown, label: 'Расходы' },
    { path: '/balance', icon: Wallet, label: 'Баланс' },
    { path: '/settings', icon: Settings, label: 'Настройки' },
  ];

  return (
    <div className="min-h-screen bg-[#2D3748]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#4A5568] border-b border-gray-600 z-50">
        <div className="h-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xl font-semibold">Finio</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{user?.name}</span>
            <button className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-500 transition">
              <User className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-500 transition">
              <Bell className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-500 transition"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 bg-[#4A5568] border-r border-gray-600 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="absolute bottom-4 left-4 right-4 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-medium"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-20 p-8">
        {children}
      </main>
    </div>
  );
}
