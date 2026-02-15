import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getIconComponent } from '../../components/IconPicker';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c'];

export default function TelegramBalance() {
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [barChartDateRange, setBarChartDateRange] = useState<'all' | 'week' | 'month' | 'year'>('month');
  const [pieChartDateRange, setPieChartDateRange] = useState<'all' | 'week' | 'month' | 'year'>('month');

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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const totalPlanned = accounts.reduce((sum, acc) => sum + parseFloat(acc.planned_balance || 0), 0);
  const totalActual = accounts.reduce((sum, acc) => sum + parseFloat(acc.actual_balance || 0), 0);
  const balance = (stats?.totalIncome || 0) - (stats?.totalExpense || 0);

  // Filter function for date ranges
  const filterTransactionsByDateRange = (transactions: any[], dateRange: string) => {
    if (dateRange === 'all' || !transactions || transactions.length === 0) return transactions;
    
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 365);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter((item: any) => {
      const itemDate = new Date(item.transaction_date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= startDate && itemDate <= now;
    });
  };

  // Prepare monthly trend data with filtering
  const allTransactions = stats?.allTransactions || [];
  const filteredBarTransactions = filterTransactionsByDateRange(allTransactions, barChartDateRange);
  
  // Group by month for bar chart
  const monthlyDataMap = new Map<string, { income: number; expense: number }>();
  
  filteredBarTransactions.forEach((transaction: any) => {
    const date = new Date(transaction.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyDataMap.has(monthKey)) {
      monthlyDataMap.set(monthKey, { income: 0, expense: 0 });
    }
    
    const data = monthlyDataMap.get(monthKey)!;
    const amount = parseFloat(transaction.amount);
    
    if (transaction.transaction_type === 'income') {
      data.income += amount;
    } else if (transaction.transaction_type === 'expense') {
      data.expense += amount;
    }
  });
  
  // Convert map to array and sort by date
  const monthlyData = Array.from(monthlyDataMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        income: data.income,
        expense: data.expense
      };
    });

  // Prepare category expenses data with filtering
  const expenseTransactions = allTransactions.filter((t: any) => t.transaction_type === 'expense');
  const filteredPieTransactions = filterTransactionsByDateRange(expenseTransactions, pieChartDateRange);
  
  // Group by category for pie chart
  const categoryDataMap = new Map<string, number>();
  
  filteredPieTransactions.forEach((transaction: any) => {
    const categoryName = transaction.category_name || 'Без категории';
    const amount = parseFloat(transaction.amount);
    
    if (!categoryDataMap.has(categoryName)) {
      categoryDataMap.set(categoryName, 0);
    }
    
    categoryDataMap.set(categoryName, categoryDataMap.get(categoryName)! + amount);
  });
  
  const categoryData = Array.from(categoryDataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-white/60 text-xs mb-1">Баланс</p>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {balance >= 0 ? '+' : ''}{balance.toFixed(0)} ₽
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-white/60 text-xs mb-1">Доходы</p>
          <p className="text-xl font-bold text-white">{(stats?.totalIncome || 0).toFixed(0)} ₽</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-white/60 text-xs mb-1">Расходы</p>
          <p className="text-xl font-bold text-white">{(stats?.totalExpense || 0).toFixed(0)} ₽</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-white/60 text-xs mb-1">На счетах</p>
          <p className="text-xl font-bold text-white">{totalActual.toFixed(0)} ₽</p>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Доходы vs Расходы</h2>
          <div className="flex gap-1">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setBarChartDateRange(period as any)}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all ${
                  barChartDateRange === period
                    ? 'bg-white text-gray-900'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {period === 'week' && '7д'}
                {period === 'month' && '30д'}
                {period === 'year' && '365д'}
              </button>
            ))}
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barGap={2} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af" 
                style={{ fontSize: '10px' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                style={{ fontSize: '10px' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '11px',
                  padding: '8px 12px'
                }}
                formatter={(value: any) => [`${parseFloat(value).toFixed(0)} ₽`, '']}
              />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={30} />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[180px]">
            <p className="text-gray-400 text-xs">Нет данных</p>
          </div>
        )}
      </div>

      {/* Category Expenses Pie Chart */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Расходы по категориям</h2>
          <div className="flex gap-1">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setPieChartDateRange(period as any)}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all ${
                  pieChartDateRange === period
                    ? 'bg-white text-gray-900'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {period === 'week' && '7д'}
                {period === 'month' && '30д'}
                {period === 'year' && '365д'}
              </button>
            ))}
          </div>
        </div>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '11px',
                  padding: '8px 12px'
                }}
                formatter={(value: any) => [`${parseFloat(value).toFixed(0)} ₽`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[180px]">
            <p className="text-gray-400 text-xs">Нет данных</p>
          </div>
        )}
      </div>

      {/* Accounts Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
        <h2 className="text-sm font-semibold text-white mb-3">Счета</h2>
        {accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white/5 rounded-xl p-3 border border-purple-500/10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl">
                    {account.icon === 'wallet' && '💳'}
                    {account.icon === 'card' && '💳'}
                    {account.icon === 'bank' && '🏦'}
                    {account.icon === 'savings' && '🐷'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{account.name}</p>
                    <p className="text-xs text-gray-400">{account.percentage}%</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="text-gray-400">План: </span>
                    <span className="text-white font-semibold">{parseFloat(account.planned_balance || 0).toFixed(0)} ₽</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Факт: </span>
                    <span className="text-green-400 font-semibold">{parseFloat(account.actual_balance || 0).toFixed(0)} ₽</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4 text-xs">Нет счетов</p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
        <h2 className="text-sm font-semibold text-white mb-3">Последние транзакции</h2>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-2">
            {stats.recentTransactions.slice(0, 5).map((transaction: any) => {
              const IconComponent = getIconComponent(transaction.category_icon);
              return (
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
                      <IconComponent className="w-5 h-5 text-white" />
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
                    <p className="text-gray-400 text-[10px] flex items-center gap-1 justify-end">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(transaction.transaction_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4 text-xs">Нет транзакций</p>
        )}
      </div>
    </div>
  );
}
