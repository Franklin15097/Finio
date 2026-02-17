import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { getIconComponent } from '../components/IconPicker';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  BarChart3,
  CreditCard,
  Target,
  Activity,
  DollarSign,
  Zap
} from 'lucide-react';
import { BalanceChart } from '../components/charts/BalanceChart';
import ProgressBar from '../components/charts/ProgressBar';
import SparklineChart from '../components/charts/SparklineChart';
import { isTelegramWebApp } from '../utils/telegram';
import TelegramBalance from './telegram/TelegramBalance';

export default function DashboardImproved() {
  if (isTelegramWebApp()) {
    return <TelegramBalance />;
  }

  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [statsData, accountsData, transactionsData] = await Promise.all([
        api.getDashboardStats(),
        api.getAccounts(),
        api.getTransactions()
      ]);
      setStats(statsData);
      setAccounts(accountsData);
      setAllTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useRealtimeSync({
    onTransactionCreated: loadData,
    onTransactionUpdated: loadData,
    onTransactionDeleted: loadData,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalPlanned = accounts.reduce((sum: number, acc: any) => sum + parseFloat(acc.planned_balance || 0), 0);
  const totalActual = accounts.reduce((sum: number, acc: any) => sum + parseFloat(acc.actual_balance || 0), 0);
  const balance = (stats?.totalIncome || 0) - (stats?.totalExpense || 0);
  const savingsRate = stats?.totalIncome > 0 ? ((balance / stats.totalIncome) * 100).toFixed(1) : 0;

  // Sparkline data
  const recentTransactions = allTransactions.filter((t: any) => {
    const transactionDate = new Date(t.transaction_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return transactionDate >= thirtyDaysAgo;
  });
  
  const dailyBalances: { [key: string]: number } = {};
  let cumulativeBalance = 0;
  
  recentTransactions
    .sort((a: any, b: any) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
    .forEach((t: any) => {
      const date = new Date(t.transaction_date).toISOString().split('T')[0];
      const amount = parseFloat(t.amount);
      cumulativeBalance += t.transaction_type === 'income' ? amount : -amount;
      dailyBalances[date] = cumulativeBalance;
    });
  
  const sparklineData = Object.values(dailyBalances).slice(-30);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Финансовый обзор</h1>
            <p className="text-muted-foreground text-sm">
              {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/expenses')}
          className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Grid Layout - Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Balance Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Общий баланс</p>
                <h2 className={`text-4xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-200'}`}>
                  {balance.toLocaleString('ru-RU')} ₽
                </h2>
              </div>
              {sparklineData.length > 0 && (
                <div className="bg-white/10 rounded-2xl p-3">
                  <SparklineChart
                    data={sparklineData}
                    color="rgba(255,255,255,0.9)"
                    width={100}
                    height={50}
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Изменение</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {balance >= 0 ? '+' : ''}{Math.abs(balance).toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                  <Target className="w-4 h-4" />
                  <span>Норма сбережений</span>
                </div>
                <p className="text-white font-bold text-lg">{savingsRate}%</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/income')}
              className="glass-card rounded-2xl p-4 hover:scale-105 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-xs mb-1">Доходы</p>
              <p className="text-xl font-bold text-foreground">{(stats?.totalIncome || 0).toLocaleString('ru-RU')} ₽</p>
            </button>

            <button
              onClick={() => navigate('/expenses')}
              className="glass-card rounded-2xl p-4 hover:scale-105 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-xs mb-1">Расходы</p>
              <p className="text-xl font-bold text-foreground">{(stats?.totalExpense || 0).toLocaleString('ru-RU')} ₽</p>
            </button>

            <button
              onClick={() => navigate('/accounts')}
              className="glass-card rounded-2xl p-4 hover:scale-105 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-xs mb-1">Счета</p>
              <p className="text-xl font-bold text-foreground">{totalActual.toLocaleString('ru-RU')} ₽</p>
            </button>

            <button
              onClick={() => navigate('/analytics')}
              className="glass-card rounded-2xl p-4 hover:scale-105 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-xs mb-1">Транзакции</p>
              <p className="text-xl font-bold text-foreground">{allTransactions.length}</p>
            </button>
          </div>

          {/* Balance Chart */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Динамика баланса</h2>
              <button
                onClick={() => navigate('/analytics')}
                className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Подробнее
              </button>
            </div>
            <BalanceChart transactions={allTransactions} height={250} />
          </div>

          {/* Income vs Expenses */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Доходы vs Расходы</h2>
            <ProgressBar
              leftValue={stats?.totalIncome || 0}
              rightValue={stats?.totalExpense || 0}
              leftLabel="Доходы"
              rightLabel="Расходы"
              leftColor="#10b981"
              rightColor="#ef4444"
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-muted-foreground text-xs mb-1">Средний доход</p>
                <p className="text-green-600 dark:text-green-400 font-bold">
                  {stats?.totalIncome > 0 ? (stats.totalIncome / 30).toFixed(0) : 0} ₽/день
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs mb-1">Средний расход</p>
                <p className="text-red-600 dark:text-red-400 font-bold">
                  {stats?.totalExpense > 0 ? (stats.totalExpense / 30).toFixed(0) : 0} ₽/день
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Accounts & Transactions */}
        <div className="space-y-6">
          {/* Accounts */}
          {accounts.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Счета</h2>
                <button
                  onClick={() => navigate('/accounts')}
                  className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Все
                </button>
              </div>
              <div className="space-y-3">
                {accounts.slice(0, 4).map((account: any) => {
                  const progress = (parseFloat(account.actual_balance || 0) / parseFloat(account.planned_balance || 1)) * 100;
                  return (
                    <div
                      key={account.id}
                      onClick={() => navigate('/accounts')}
                      className="bg-card/50 hover:bg-card/80 rounded-xl p-4 border border-border cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-lg">
                            {account.icon === 'wallet' && '💳'}
                            {account.icon === 'card' && '💳'}
                            {account.icon === 'bank' && '🏦'}
                            {account.icon === 'savings' && '🐷'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{account.name}</p>
                            <p className="text-xs text-muted-foreground">{account.percentage}%</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {parseFloat(account.actual_balance || 0).toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Последние транзакции</h2>
            {stats?.recentTransactions?.length > 0 ? (
              <div className="space-y-2">
                {stats.recentTransactions.slice(0, 6).map((transaction: any) => {
                  const IconComponent = getIconComponent(transaction.category_icon);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between bg-card/50 hover:bg-card/80 rounded-xl p-3 border border-border cursor-pointer transition-all"
                      onClick={() => navigate('/expenses')}
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
                          <p className="text-foreground text-sm font-semibold">{transaction.category_name}</p>
                          <p className="text-muted-foreground text-xs">{transaction.description || 'Без описания'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          transaction.transaction_type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}
                          {parseFloat(transaction.amount).toLocaleString('ru-RU')} ₽
                        </p>
                        <p className="text-muted-foreground text-xs flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.transaction_date).toLocaleDateString('ru-RU', { 
                            day: '2-digit', 
                            month: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground text-sm mb-2">Нет транзакций</p>
                <button
                  onClick={() => navigate('/expenses')}
                  className="text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  Добавить первую транзакцию
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Быстрые действия</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/income')}
                className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl p-4 transition-all group"
              >
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-foreground">Добавить доход</p>
              </button>
              <button
                onClick={() => navigate('/expenses')}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl p-4 transition-all group"
              >
                <Zap className="w-6 h-6 text-red-600 dark:text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-foreground">Добавить расход</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
