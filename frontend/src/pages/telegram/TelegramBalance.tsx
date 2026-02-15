import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { TrendingUp, TrendingDown, Wallet, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TelegramBalance() {
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--tg-theme-button-color,#3390ec)]"></div>
      </div>
    );
  }

  const balance = (stats?.totalIncome || 0) - (stats?.totalExpense || 0);
  const totalActual = accounts.reduce((sum, acc) => sum + parseFloat(acc.actual_balance || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Balance */}
      <div className="p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Главная</h1>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>
        
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/90 text-sm font-medium">Общий баланс</span>
          </div>
          <div className="text-5xl font-bold text-white mb-6">
            {balance.toFixed(2)} ₽
          </div>
          
          {/* Income/Expense Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-white/90 font-medium">Доходы</span>
              </div>
              <div className="text-xl font-bold text-white">
                +{(stats?.totalIncome || 0).toFixed(0)} ₽
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-400 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-white/90 font-medium">Расходы</span>
              </div>
              <div className="text-xl font-bold text-white">
                -{(stats?.totalExpense || 0).toFixed(0)} ₽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/income')}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg active:scale-95 transition-all"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Добавить доход</div>
          </button>
          
          <button
            onClick={() => navigate('/expenses')}
            className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-4 shadow-lg active:scale-95 transition-all"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Добавить расход</div>
          </button>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Счета</h2>
          <button 
            onClick={() => navigate('/accounts')}
            className="text-purple-400 text-sm font-medium flex items-center gap-1"
          >
            Все
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.slice(0, 3).map((account) => (
              <div
                key={account.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl">
                      {account.icon === 'wallet' && '💳'}
                      {account.icon === 'card' && '💳'}
                      {account.icon === 'bank' && '🏦'}
                      {account.icon === 'savings' && '🐷'}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{account.name}</div>
                      <div className="text-xs text-slate-400">{account.percentage}%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">
                      {parseFloat(account.actual_balance || 0).toFixed(0)} ₽
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-700/50">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-slate-400 text-sm">Нет счетов</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Последние операции</h2>
        </div>
        
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTransactions.slice(0, 5).map((transaction: any) => (
              <div
                key={transaction.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.transaction_type === 'income' 
                        ? 'bg-green-500/20' 
                        : 'bg-red-500/20'
                    }`}>
                      <span className="text-xl">
                        {transaction.transaction_type === 'income' ? '💰' : '💸'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {transaction.category_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {transaction.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {parseFloat(transaction.amount).toFixed(0)} ₽
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(transaction.transaction_date).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-700/50">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-slate-400 text-sm">Нет транзакций</p>
          </div>
        )}
      </div>
    </div>
  );
}
