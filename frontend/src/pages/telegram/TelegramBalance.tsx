import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { getIconComponent } from '../../components/IconPicker';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calendar, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { BalanceChart } from '../../components/charts/BalanceChart';
import ProgressBar from '../../components/charts/ProgressBar';
import SparklineChart from '../../components/charts/SparklineChart';
import CircularProgress from '../../components/CircularProgress';

export default function TelegramBalance() {
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

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
      setStats(statsData);
      setAccounts(accountsData);
      setAllTransactions(transactionsData);
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

  // Prepare sparkline data for recent trend (last 30 days)
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
    <div className="p-4 space-y-4 pb-24">
      {/* Circular Progress Indicators */}
      <div className="glass-card rounded-2xl p-4 border border-border/30">
        <h2 className="text-sm font-semibold text-white mb-4">Финансовое здоровье</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <CircularProgress
              value={stats?.totalIncome || 0}
              max={(stats?.totalIncome || 0) + (stats?.totalExpense || 0)}
              size={90}
              strokeWidth={6}
              color="#10b981"
              label="Доходы"
            />
          </div>
          <div className="flex flex-col items-center">
            <CircularProgress
              value={Math.abs(balance)}
              max={(stats?.totalIncome || 0) + (stats?.totalExpense || 0)}
              size={90}
              strokeWidth={6}
              color={balance >= 0 ? '#8b5cf6' : '#ef4444'}
              label="Баланс"
            />
          </div>
          <div className="flex flex-col items-center">
            <CircularProgress
              value={totalActual}
              max={totalPlanned > 0 ? totalPlanned : totalActual}
              size={90}
              strokeWidth={6}
              color="#3b82f6"
              label="Счета"
            />
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-white/60 text-xs mb-1">Баланс</p>
          <div className="flex items-end justify-between">
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(0)} ₽
            </p>
            {sparklineData.length > 0 && (
              <SparklineChart
                data={sparklineData}
                color={balance >= 0 ? '#10b981' : '#ef4444'}
                width={60}
                height={30}
              />
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-white/60 text-xs mb-1">Доходы</p>
          <p className="text-xl font-bold text-white">{(stats?.totalIncome || 0).toFixed(0)} ₽</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-white/60 text-xs mb-1">Расходы</p>
          <p className="text-xl font-bold text-white">{(stats?.totalExpense || 0).toFixed(0)} ₽</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-white/60 text-xs mb-1">На счетах</p>
          <p className="text-xl font-bold text-white">{totalActual.toFixed(0)} ₽</p>
        </div>
      </div>

      {/* Balance Trend Chart */}
      <div className="glass-card rounded-2xl p-4 border border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Динамика баланса</h2>
        </div>
        <BalanceChart transactions={allTransactions} height={220} />
      </div>

      {/* Income vs Expenses Progress Bar */}
      <div className="glass-card rounded-2xl p-4 border border-border/30">
        <h2 className="text-sm font-semibold text-white mb-4">Доходы vs Расходы</h2>
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

      {/* Accounts Section */}
      <div className="glass-card rounded-2xl p-4 border border-border/30">
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
      <div className="glass-card rounded-2xl p-4 border border-border/30">
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
