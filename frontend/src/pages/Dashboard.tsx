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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Панель управления
          </h1>
          <p className="text-white/60 text-sm">Обзор финансовой активности</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-2">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-xs mb-1">Общий баланс</p>
          <p className="text-xl font-bold text-white">
            {stats?.totalBalance?.toFixed(0) || '0'} ₽
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-xs mb-1">Доходы</p>
          <p className="text-xl font-bold text-white">
            {stats?.monthlyIncome?.toFixed(0) || '0'} ₽
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-xs mb-1">Расходы</p>
          <p className="text-xl font-bold text-white">
            {stats?.monthlyExpense?.toFixed(0) || '0'} ₽
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
        <h2 className="text-sm font-semibold text-white mb-4">Доходы vs Расходы</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '10px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                border: 'none',
                borderRadius: '12px',
                color: '#1f2937',
                padding: '8px 12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
        <h2 className="text-sm font-semibold text-white mb-3">Последние транзакции</h2>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-2">
            {stats.recentTransactions.slice(0, 5).map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-purple-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    transaction.transaction_type === 'income' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600'
                  }`}>
                    <span className="text-lg">{transaction.category_icon}</span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{transaction.category_name}</p>
                    <p className="text-gray-400 text-[10px]">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm flex items-center gap-1 ${
                    transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.transaction_type === 'income' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {parseFloat(transaction.amount).toFixed(0)} ₽
                  </p>
                  <p className="text-gray-400 text-[10px]">{new Date(transaction.transaction_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4 text-xs">Нет транзакций</p>
        )}
      </div>
    </div>
  );
}
