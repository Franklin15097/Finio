import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
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
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyData = stats?.monthlyTrend?.reduce((acc: any[], item: any) => {
    const existing = acc.find(d => d.month === item.month);
    if (existing) {
      existing[item.type] = parseFloat(item.total);
    } else {
      acc.push({
        month: item.month,
        [item.type]: parseFloat(item.total)
      });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            ${stats?.totalBalance?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Monthly Income</p>
          <p className="text-3xl font-bold text-gray-900">
            ${stats?.monthlyIncome?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Monthly Expenses</p>
          <p className="text-3xl font-bold text-gray-900">
            ${stats?.monthlyExpense?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTransactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    transaction.transaction_type === 'income' ? 'bg-green-100' : 'bg-indigo-100'
                  }`}>
                    {transaction.category_icon}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{transaction.category_name}</p>
                    <p className="text-gray-500 text-sm">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold flex items-center gap-1 ${
                    transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    ${parseFloat(transaction.amount).toFixed(2)}
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
    </div>
  );
}
