import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function Balance() {
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, accountsData] = await Promise.all([
        api.getDashboardStats(),
        api.getAccounts()
      ]);
      setStats(statsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalPlanned = accounts.reduce((sum, acc) => sum + parseFloat(acc.planned_balance || 0), 0);
  const totalActual = accounts.reduce((sum, acc) => sum + parseFloat(acc.actual_balance || 0), 0);
  const balance = (stats?.totalIncome || 0) - (stats?.totalExpense || 0);

  // Prepare monthly trend data
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

  // Prepare category expenses data
  const categoryData = stats?.categoryExpenses?.filter((c: any) => c.total > 0).map((c: any) => ({
    name: c.name,
    value: parseFloat(c.total)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Баланс
        </h1>
        <p className="text-gray-400">Обзор финансов в реальном времени</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">Баланс</p>
            </div>
            <p className={`text-4xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)} ₽
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">Доходы</p>
            </div>
            <p className="text-4xl font-bold text-white">{(stats?.totalIncome || 0).toFixed(2)} ₽</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">Расходы</p>
            </div>
            <p className="text-4xl font-bold text-white">{(stats?.totalExpense || 0).toFixed(2)} ₽</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">На счетах</p>
            </div>
            <p className="text-4xl font-bold text-white">{totalActual.toFixed(2)} ₽</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Доходы vs Расходы</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => `${parseFloat(value).toFixed(2)} ₽`}
                />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} name="Доходы" />
                <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} name="Расходы" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Нет данных</p>
          )}
        </div>

        {/* Category Expenses Pie Chart */}
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Расходы по категориям</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => `${parseFloat(value).toFixed(2)} ₽`}
                />
                <Legend 
                  wrapperStyle={{ color: '#fff' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Нет данных</p>
          )}
        </div>
      </div>

      {/* Accounts Section */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Счета</h2>
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
                    {account.icon === 'wallet' && '💳'}
                    {account.icon === 'card' && '💳'}
                    {account.icon === 'bank' && '🏦'}
                    {account.icon === 'savings' && '🐷'}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{account.name}</p>
                    <p className="text-sm text-gray-400">{account.percentage}%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">План:</span>
                    <span className="text-white font-semibold">{parseFloat(account.planned_balance || 0).toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Факт:</span>
                    <span className="text-green-400 font-semibold">{parseFloat(account.actual_balance || 0).toFixed(2)} ₽</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Нет счетов</p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Последние транзакции</h2>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentTransactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-all"
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
                  <p className={`font-bold text-lg ${
                    transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.transaction_type === 'income' ? '+' : '-'}{parseFloat(transaction.amount).toFixed(2)} ₽
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" />
                    {new Date(transaction.transaction_date).toLocaleDateString('ru-RU')}
                  </p>
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
