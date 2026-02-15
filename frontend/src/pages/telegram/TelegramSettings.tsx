import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User, LogOut, Sparkles, ChevronRight, Save } from 'lucide-react';

export default function TelegramSettings() {
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePercentageChange = (id: number, value: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, percentage: value } : acc
    ));
  };

  const saveDistribution = async () => {
    setSaving(true);
    try {
      const total = accounts.reduce((sum, acc) => sum + parseFloat(acc.percentage || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        alert(`Сумма процентов должна быть 100%. Сейчас: ${total.toFixed(2)}%`);
        setSaving(false);
        return;
      }

      for (const account of accounts) {
        await api.updateAccount(account.id, {
          percentage: parseFloat(account.percentage)
        });
      }

      alert('Распределение сохранено!');
      loadAccounts();
    } catch (error) {
      console.error('Failed to save distribution:', error);
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const totalPercentage = accounts.reduce((sum, acc) => sum + parseFloat(acc.percentage || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color,#f5f5f5)] pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white p-6 pb-8 rounded-b-[32px] shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Настройки</h1>
        
        {/* User Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">{user?.name}</div>
              {user?.telegram_username && (
                <div className="text-sm text-white/80">@{user.telegram_username}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 -mt-4 space-y-3">
        {/* Telegram Connection */}
        {user?.telegram_id && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-sm">Telegram подключен</div>
                <div className="text-xs text-gray-500">Ваш аккаунт связан</div>
              </div>
            </div>
          </div>
        )}

        {/* Distribution Settings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowDistribution(!showDistribution)}
            className="w-full p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800 text-sm">Распределение доходов</div>
                <div className="text-xs text-gray-500">Настройка процентов</div>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showDistribution ? 'rotate-90' : ''}`} />
          </button>

          {showDistribution && (
            <div className="px-4 pb-4 border-t border-gray-100">
              {/* Total Indicator */}
              <div className={`my-3 p-3 rounded-xl ${
                Math.abs(totalPercentage - 100) < 0.01 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Всего:</span>
                  <span className={`font-bold ${
                    Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalPercentage.toFixed(1)}%
                  </span>
                </div>
                {Math.abs(totalPercentage - 100) >= 0.01 && (
                  <div className="text-xs text-red-600 mt-1">
                    Должно быть 100%
                  </div>
                )}
              </div>

              {/* Accounts */}
              <div className="space-y-2 mb-3">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center gap-2">
                    <div className="flex-1 text-sm text-gray-700 truncate">
                      {account.name}
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={account.percentage}
                      onChange={(e) => handlePercentageChange(account.id, e.target.value)}
                      className="w-20 px-2 py-1 text-right bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                ))}
              </div>

              <button
                onClick={saveDistribution}
                disabled={saving}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-lg font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Имя</div>
              <div className="text-sm font-medium text-gray-800">{user?.name}</div>
            </div>
            {user?.email && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="text-sm font-medium text-gray-800">{user.email}</div>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center gap-2 text-red-600 font-semibold active:scale-95 transition-transform"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </div>
    </div>
  );
}
