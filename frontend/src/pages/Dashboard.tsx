import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LogOut, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Finio</h1>
              <p className="text-gray-400 text-sm">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-600 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-white">
              ${stats?.totalBalance?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Monthly Income</p>
            <p className="text-3xl font-bold text-white">
              ${stats?.monthlyIncome?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600 rounded-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Monthly Expenses</p>
            <p className="text-3xl font-bold text-white">
              ${stats?.monthlyExpense?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
          {stats?.recentTransactions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTransactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{transaction.category_icon}</div>
                    <div>
                      <p className="text-white font-medium">{transaction.category_name}</p>
                      <p className="text-gray-400 text-sm">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.transaction_type === 'income'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {transaction.transaction_type === 'income' ? '+' : '-'}$
                      {parseFloat(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm">{transaction.transaction_date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
