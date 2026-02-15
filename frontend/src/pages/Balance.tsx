import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getIconComponent } from '../components/IconPicker';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import LineChart from '../components/charts/LineChart';
import ProgressBar from '../components/charts/ProgressBar';
import SparklineChart from '../components/charts/SparklineChart';
import { isTelegramWebApp } from '../utils/telegram';
import TelegramBalance from './telegram/TelegramBalance';

export default function Balance() {
  // Use Telegram version if in Telegram Mini App
  if (isTelegramWebApp()) {
    return <TelegramBalance />;
  }
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<string>('all');

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

  // Prepare data for balance trend chart
  const allTransactions = stats?.allTransactions || [];
  
  // Filter by period
  const filterByPeriod = (transactions: any[], period: string) => {
    if (period === 'all') return transactions;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setDate(now.getDate() - 365);
        break;
    }
    
    return transactions.filter((t: any) => new Date(t.transaction_date) >= startDate);
  };

  const filteredTransactions = filterByPeriod(allTransactions, chartPeriod);
  
  // Calculate cumulative balance over time
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );
  
  let cumulativeBalance = 0;
  const balanceData = sortedTransactions.map((t: any) => {
    const amount = parseFloat(t.amount);
    cumulativeBalance += t.transaction_type === 'income' ? amount : -amount;
    return { value: cumulativeBalance };
  });

  // Add current balance if no data
  if (balanceData.length === 0) {
    balanceData.push({ value: balance });
  }

  // Prepare sparkline data for recent trend (last 30 days)
  const recentTransactions = filterByPeriod(allTransactions, 'month');
  const dailyBalances: { [key: string]: number } = {};
  
  recentTransactions.forEach((t: any) => {
    const date = new Date(t.transaction_date).toISOString().split('T')[0];
    if (!dailyBalances[date]) dailyBalances[date] = 0;
    const amount = parseFloat(t.amount);
    dailyBalances[date] += t.transaction_type === 'income' ? amount : -amount;
  });
  
  const sparklineData = Object.values(dailyBalances).slice(-30);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Баланс
            </h1>
            <p className="text-white/80 text-lg">Обзор финансов в реальном времени</p>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-purple-500/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-white/80 text-sm font-medium mb-1">Баланс</p>
            <div className="flex items-end justify-between">
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {balance >= 0 ? '+' : ''}{balance.toFixed(2)} ₽
              </p>
              {sparklineData.length > 0 && (
                <SparklineChart
                  data={sparklineData}
                  color={balance >= 0 ? '#10b981' : '#ef4444'}
                  width={80}
                  height={40}
                />
              )}
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-purple-500/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-purple-200 text-sm font-medium mb-1">Доходы</p>
            <p className="text-3xl font-bold text-white">{(stats?.totalIncome || 0).toFixed(2)} ₽</p>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-purple-500/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-purple-200 text-sm font-medium mb-1">Расходы</p>
            <p className="text-3xl font-bold text-white">{(stats?.totalExpense || 0).toFixed(2)} ₽</p>
          </div>
        </div>

        <div className="relative group">
          <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 border border-purple-500/20 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-purple-200 text-sm font-medium mb-1">На счетах</p>
            <p className="text-3xl font-bold text-white">{totalActual.toFixed(2)} ₽</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="space-y-6">
        {/* Balance Trend Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 hover:scale-[1.01] transition-all duration-300 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              Динамика баланса
            </h2>
          </div>
          {balanceData.length > 0 ? (
            <LineChart
              data={balanceData}
              color={balance >= 0 ? '#10b981' : '#ef4444'}
              height={300}
              showPeriods={true}
              currentPeriod={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-400 text-sm">Нет данных для отображения</p>
            </div>
          )}
        </div>

        {/* Income vs Expenses Progress Bar */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 hover:scale-[1.01] transition-all duration-300 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-white mb-6">Доходы vs Расходы</h2>
          <ProgressBar
            leftValue={stats?.totalIncome || 0}
            rightValue={stats?.totalExpense || 0}
            leftLabel="Доходы"
            rightLabel="Расходы"
            leftColor="#10b981"
            rightColor="#ef4444"
            totalLabel="Общий оборот"
            totalValue={(stats?.totalIncome || 0) + (stats?.totalExpense || 0)}
          />
        </div>
      </div>

      {/* Accounts Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-purple-500/20">
        <h2 className="text-xl font-semibold text-white mb-6">Счета</h2>
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white/5 hover:bg-white/10 rounded-[24px] p-6 transition-all duration-300 hover:scale-[1.02] border border-purple-500/20"
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
      <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-purple-500/20">
        <h2 className="text-xl font-semibold text-white mb-6">Последние транзакции</h2>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTransactions.map((transaction: any) => {
              const IconComponent = getIconComponent(transaction.category_icon);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-[20px] p-5 transition-all border border-purple-500/20"
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
                    <p className={`font-bold text-lg flex items-center gap-1 justify-end ${
                      transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.transaction_type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {parseFloat(transaction.amount).toFixed(2)} ₽
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
