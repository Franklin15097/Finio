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
  CreditCard
} from 'lucide-react';
import { BalanceChart } from '../components/charts/BalanceChart';
import ProgressBar from '../components/charts/ProgressBar';
import SparklineChart from '../components/charts/SparklineChart';
import { isTelegramWebApp } from '../utils/telegram';
import TelegramBalance from './telegram/TelegramBalance';

export default function DashboardV3() {
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
    onAccountChanged: loadData,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const totalPlanned = accounts.reduce((sum, acc) => sum + parseFloat(acc.planned_balance || 0), 0);
  const totalActual = accounts.reduce((sum, acc) => sum + parseFloat(acc.actual_balance || 0), 0);
  const balance = (stats?.totalIncome || 0) - (stats?.totalExpense || 0);

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
            <h1 className="text-2xl font-bold text-foreground">Главная</h1>
            <p className="text-muted-foreground text-sm">
              {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
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

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 shadow-2xl">
        <p className="text-white/80 text-sm mb-2">Общий баланс</p>
        <div className="flex items-end justify-between mb-4">
          <h2 className={`text-4xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-200'}`}>
            {balance.toLocaleString('ru-RU')} ₽
          </h2>
          {sparklineData.length > 0 && (
            <SparklineChart
              data={sparklineData}
              color="rgba(255,255,255,0.8)"
              width={80}
              height={40}
            />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-white/90 text-sm">
          {balance >= 0 ? (
            <>
              <ArrowUpRight className="w-4 h-4" />
              <span>+{Math.abs(balance).toLocaleString('ru-RU')} ₽</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-4 h-4" />
              <span>-{Math.abs(balance).toLocaleString('ru-RU')} ₽</span>
            </>
          )}
          <span className="text-white/60">за месяц</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/income')}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-green-500/20 hover:bg-white/15 transition-all"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <p className="text-white/60 text-xs mb-1">Доходы</p>
          <p className="text-lg font-bold text-white">{(stats?.totalIncome || 0).toLocaleString('ru-RU')} ₽</p>
        </button>

        <button
          onClick={() => navigate('/expenses')}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-red-500/20 hover:bg-white/15 transition-all"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <p className="text-white/60 text-xs mb-1">Расходы</p>
          <p className="text-lg font-bold text-white">{(stats?.totalExpense || 0).toLocaleString('ru-RU')} ₽</p>
        </button>

        <button
          onClick={() => navigate('/accounts')}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 hover:bg-white/15 transition-all"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center mb-2">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <p className="text-white/60 text-xs mb-1">Счета</p>
          <p className="text-lg font-bold text-white">{totalActual.toLocaleString('ru-RU')} ₽</p>
        </button>
      </div>

      {/* Balance Chart */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Динамика баланса</h2>
          <button
            onClick={() => navigate('/analytics')}
            className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            Аналитика
          </button>
        </div>
        <BalanceChart transactions={allTransactions} height={200} />
      </div>

      {/* Income vs Expenses */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
        <h2 className="text-base font-semibold text-white mb-4">Доходы vs Расходы</h2>
        <ProgressBar
          leftValue={stats?.totalIncome || 0}
          rightValue={stats?.totalExpense || 0}
          leftLabel="Доходы"
          rightLabel="Расходы"
          leftColor="#10b981"
          rightColor="#ef4444"
        />
      </div>

      {/* Accounts */}
      {accounts.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Счета</h2>
            <button
              onClick={() => navigate('/accounts')}
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              <CreditCard className="w-4 h-4" />
              Все счета
            </button>
          </div>
          <div className="space-y-3">
            {accounts.slice(0, 3).map((account) => (
              <div
                key={account.id}
                onClick={() => navigate('/accounts')}
                className="bg-white/5 rounded-xl p-4 border border-purple-500/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl">
                      {account.icon === 'wallet' && '💳'}
                      {account.icon === 'card' && '💳'}
                      {account.icon === 'bank' && '🏦'}
                      {account.icon === 'savings' && '🐷'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{account.name}</p>
                      <p className="text-xs text-white/60">{account.percentage}% от дохода</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {parseFloat(account.actual_balance || 0).toLocaleString('ru-RU')} ₽
                    </p>
                    <p className="text-xs text-white/60">
                      План: {parseFloat(account.planned_balance || 0).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (parseFloat(account.actual_balance || 0) / parseFloat(account.planned_balance || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
        <h2 className="text-base font-semibold text-white mb-4">Последние транзакции</h2>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-2">
            {stats.recentTransactions.slice(0, 5).map((transaction: any) => {
              const IconComponent = getIconComponent(transaction.category_icon);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-purple-500/10 hover:bg-white/10 transition-all cursor-pointer"
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
                      <p className="text-white text-sm font-semibold">{transaction.category_name}</p>
                      <p className="text-white/60 text-xs">{transaction.description || 'Без описания'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {parseFloat(transaction.amount).toLocaleString('ru-RU')} ₽
                    </p>
                    <p className="text-white/60 text-xs flex items-center gap-1 justify-end">
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
            <p className="text-white/60 text-sm mb-2">Нет транзакций</p>
            <button
              onClick={() => navigate('/expenses')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Добавить первую транзакцию
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
