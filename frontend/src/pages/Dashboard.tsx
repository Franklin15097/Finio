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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center shadow-xl">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">
            Панель управления
          </h1>
          <p className="text-white/80 text-lg">Обзор финансовой активности</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-purple-500/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-purple-200 text-sm mb-1">Общий баланс</p>
            <p className="text-3xl font-bold text-white">
              {stats?.totalBalance?.toFixed(2) || '0.00'} ₽
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-purple-500/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-purple-200 text-sm mb-1">Доходы за месяц</p>
            <p className="text-3xl font-bold text-white">
              {stats?.monthlyIncome?.toFixed(2) || '0.00'} ₽
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-purple-500/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-purple-200 text-sm mb-1">Расходы за месяц</p>
            <p className="text-3xl font-bold text-white">
              {stats?.monthlyExpense?.toFixed(2) || '0.00'} ₽
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-purple-500/20">
        <h2 className="text-xl font-bold text-white mb-6">Доходы vs Расходы</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                border: 'none',
                borderRadius: '16px',
                color: '#1f2937',
                padding: '12px 16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
              }}
            />
            <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-purple-500/20">
        <h2 className="text-xl font-bold text-white mb-6">Последние транзакции</h2>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTransactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-[20px] p-5 transition-all border border-purple-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    transaction.transaction_type === 'income' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600'
                  }`}>
                    {transaction.category_icon}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{transaction.category_name}</p>
                    <p className="text-gray-400 text-sm">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold flex items-center gap-1 ${
                    transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.transaction_type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {parseFloat(transaction.amount).toFixed(2)} ₽
                  </p>
                  <p className="text-gray-400 text-sm">{transaction.transaction_date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Нет транзакций</p>
        )}
      </div>
    </div>
  );
}
