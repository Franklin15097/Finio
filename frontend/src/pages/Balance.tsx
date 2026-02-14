import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getIconComponent } from '../components/IconPicker';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c'];

export default function Balance() {
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [barChartDateRange, setBarChartDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [pieChartDateRange, setPieChartDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, accountsData, transactionsData] = await Promise.all([
        api.getDashboardStats(),
        api.getAccounts(),
        api.getTransactions()
      ]);
      setStats({...statsData, allTransactions: transactionsData});
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

  // Filter function for date ranges
  const filterTransactionsByDateRange = (transactions: any[], dateRange: string) => {
    if (dateRange === 'all' || !transactions) return transactions;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate.setDate(startDate.getDate() - 365);
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    
    return transactions.filter((item: any) => {
      const itemDate = new Date(item.transaction_date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= startDate && itemDate <= today;
    });
  };

  // Prepare monthly trend data with filtering
  const filteredBarTransactions = filterTransactionsByDateRange(stats?.allTransactions || [], barChartDateRange);
  
  const monthlyData = filteredBarTransactions.reduce((acc: any[], transaction: any) => {
    const month = new Date(transaction.transaction_date).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    const existing = acc.find(d => d.month === month);
    const amount = parseFloat(transaction.amount);
    
    if (existing) {
      if (transaction.transaction_type === 'income') {
        existing.income = (existing.income || 0) + amount;
      } else {
        existing.expense = (existing.expense || 0) + amount;
      }
    } else {
      acc.push({
        month,
        income: transaction.transaction_type === 'income' ? amount : 0,
        expense: transaction.transaction_type === 'expense' ? amount : 0
      });
    }
    return acc;
  }, []);

  // Prepare category expenses data with filtering
  const filteredPieTransactions = filterTransactionsByDateRange(
    (stats?.allTransactions || []).filter((t: any) => t.transaction_type === 'expense'),
    pieChartDateRange
  );
  
  const categoryData = filteredPieTransactions.reduce((acc: any[], transaction: any) => {
    const existing = acc.find(c => c.name === transaction.category_name);
    const amount = parseFloat(transaction.amount);
    
    if (existing) {
      existing.value += amount;
    } else {
      acc.push({
        name: transaction.category_name,
        value: amount
      });
    }
    return acc;
  }, []).filter((c: any) => c.value > 0);

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
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-white/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">Баланс</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)} ₽
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-white/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">Доходы</p>
            <p className="text-3xl font-bold text-white">{(stats?.totalIncome || 0).toFixed(2)} ₽</p>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-white/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">Расходы</p>
            <p className="text-3xl font-bold text-white">{(stats?.totalExpense || 0).toFixed(2)} ₽</p>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-white/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">На счетах</p>
            <p className="text-3xl font-bold text-white">{totalActual.toFixed(2)} ₽</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 hover:scale-[1.01] transition-all duration-300 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              Доходы vs Расходы
            </h2>
            <div className="flex gap-2">
              {['all', 'week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setBarChartDateRange(period as any)}
                  className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
                    barChartDateRange === period
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {period === 'all' && 'Всё время'}
                  {period === 'week' && '7 дней'}
                  {period === 'month' && '30 дней'}
                  {period === 'year' && '365 дней'}
                </button>
              ))}
            </div>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyData} barGap={8}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '13px', fontWeight: '500' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '13px', fontWeight: '500' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: 'none',
                    borderRadius: '16px',
                    color: '#1f2937',
                    padding: '12px 16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    fontWeight: '600'
                  }}
                  formatter={(value: any) => [`${parseFloat(value).toFixed(2)} ₽`, '']}
                  labelStyle={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 8 }}
                />
                <Bar 
                  dataKey="income" 
                  fill="url(#incomeGradient)" 
                  radius={[16, 16, 0, 0]} 
                  name="Доходы"
                  animationDuration={800}
                  animationBegin={0}
                  maxBarSize={60}
                />
                <Bar 
                  dataKey="expense" 
                  fill="url(#expenseGradient)" 
                  radius={[16, 16, 0, 0]} 
                  name="Расходы"
                  animationDuration={800}
                  animationBegin={100}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[320px]">
              <p className="text-gray-400 text-sm">Нет данных для отображения</p>
            </div>
          )}
        </div>

        {/* Category Expenses Pie Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 hover:scale-[1.01] transition-all duration-300 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              Расходы по категориям
            </h2>
            <div className="flex gap-2">
              {['all', 'week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setPieChartDateRange(period as any)}
                  className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
                    pieChartDateRange === period
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {period === 'all' && 'Всё время'}
                  {period === 'week' && '7 дней'}
                  {period === 'month' && '30 дней'}
                  {period === 'year' && '365 дней'}
                </button>
              ))}
            </div>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  animationBegin={0}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: 'none',
                    borderRadius: '16px',
                    color: '#1f2937',
                    padding: '12px 16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    fontWeight: '600'
                  }}
                  formatter={(value: any) => [`${parseFloat(value).toFixed(2)} ₽`, '']}
                  labelStyle={{ color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    color: '#fff', 
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                  iconType="circle"
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[320px]">
              <p className="text-gray-400 text-sm">Нет данных для отображения</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Accounts Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Счета</h2>
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white/5 hover:bg-white/10 rounded-[24px] p-6 transition-all duration-300 hover:scale-[1.02] border border-white/10"
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
      <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Последние транзакции</h2>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTransactions.map((transaction: any) => {
              const IconComponent = getIconComponent(transaction.category_icon);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-[20px] p-5 transition-all border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.transaction_type === 'income' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                    }`}>
                      <IconComponent className="w-6 h-6 text-white" />
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
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Нет транзакций</p>
        )}
      </div>
    </div>
  );
}
