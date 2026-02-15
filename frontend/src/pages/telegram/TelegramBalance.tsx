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
    <div className="min-h-screen bg-[var(--tg-theme-bg-color,#f5f5f5)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--tg-theme-button-color,#3390ec)] to-[#5b9ff5] text-white p-6 pb-8 rounded-b-[32px] shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Финансы</h1>
        
        {/* Main Balance Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm font-medium">Общий баланс</span>
            <Wallet className="w-5 h-5 text-white/60" />
          </div>
          <div className="text-4xl font-bold mb-4">
            {balance.toFixed(2)} ₽
          </div>
          
          {/* Income/Expense Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-xs text-white/70">Доходы</span>
              </div>
              <div className="text-lg font-bold text-green-300">
                +{(stats?.totalIncome || 0).toFixed(0)} ₽
              </div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-300" />
                <span className="text-xs text-white/70">Расходы</span>
              </div>
              <div className="text-lg font-bold text-red-300">
                -{(stats?.totalExpense || 0).toFixed(0)} ₽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/income')}
            className="bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm font-semibold text-gray-800">Добавить доход</div>
          </button>
          
          <button
            onClick={() => navigate('/expenses')}
            className="bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <Plus className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-sm font-semibold text-gray-800">Добавить расход</div>
          </button>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[var(--tg-theme-text-color,#000000)]">Счета</h2>
          <button 
            onClick={() => navigate('/accounts')}
            className="text-[var(--tg-theme-button-color,#3390ec)] text-sm font-medium flex items-center gap-1"
          >
            Все
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.slice(0, 3).map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl">
                      {account.icon === 'wallet' && '💳'}
                      {account.icon === 'card' && '💳'}
                      {account.icon === 'bank' && '🏦'}
                      {account.icon === 'savings' && '🐷'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{account.name}</div>
                      <div className="text-xs text-gray-500">{account.percentage}%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">
                      {parseFloat(account.actual_balance || 0).toFixed(0)} ₽
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-gray-500 text-sm">Нет счетов</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[var(--tg-theme-text-color,#000000)]">Последние операции</h2>
        </div>
        
        {stats?.recentTransactions?.length > 0 ? (
          <div className="space-y-2">
            {stats.recentTransactions.slice(0, 5).map((transaction: any) => (
              <div
                key={transaction.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.transaction_type === 'income' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      <span className="text-lg">
                        {transaction.transaction_type === 'income' ? '💰' : '💸'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {transaction.category_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {parseFloat(transaction.amount).toFixed(0)} ₽
                    </div>
                    <div className="text-xs text-gray-400">
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
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 text-sm">Нет транзакций</p>
          </div>
        )}
      </div>
    </div>
  );
}
