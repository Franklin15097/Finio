import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Percent, Save, Sparkles, LogOut } from 'lucide-react';
import { isTelegramWebApp } from '../utils/telegram';
import TelegramSettings from './telegram/TelegramSettings';

export default function Settings() {
  if (isTelegramWebApp()) {
    return <TelegramSettings />;
  }
  
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('distribution');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'distribution', label: 'Распределение', icon: Percent },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Настройки</h1>
          <p className="text-white/60 text-sm">Управление аккаунтом</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-semibold text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'distribution' && (
        <div className="space-y-3">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Распределение доходов</h2>
                <p className="text-gray-400 text-xs">Процент от доходов для каждого счёта</p>
              </div>
              <button
                onClick={saveDistribution}
                disabled={saving}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>

            {/* Total Percentage */}
            <div className={`mb-3 p-3 rounded-xl ${
              Math.abs(totalPercentage - 100) < 0.01 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">Общая сумма:</span>
                <span className={`text-xl font-bold ${
                  Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {totalPercentage.toFixed(2)}%
                </span>
              </div>
              {Math.abs(totalPercentage - 100) >= 0.01 && (
                <p className="text-xs text-red-400 mt-1">
                  Осталось: {(100 - totalPercentage).toFixed(2)}%
                </p>
              )}
            </div>

            {/* Accounts */}
            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white/5 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-lg">
                        {account.icon === 'wallet' && '💳'}
                        {account.icon === 'card' && '💳'}
                        {account.icon === 'bank' && '🏦'}
                        {account.icon === 'savings' && '🐷'}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{account.name}</p>
                        <p className="text-xs text-gray-400">{account.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={account.percentage}
                        onChange={(e) => handlePercentageChange(account.id, e.target.value)}
                        className="w-20 px-2 py-1.5 text-right bg-white/5 border border-white/10 rounded-lg text-white font-bold text-sm focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-400 font-semibold text-sm">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {accounts.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                  <Percent className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-400 text-sm">Нет счетов</p>
                <p className="text-gray-500 text-xs mt-1">Создайте счета на странице "Счета"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-3">
          {/* User Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{user?.name}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                {user?.telegram_id && (
                  <p className="text-purple-400 text-xs mt-1">Telegram ID: {user.telegram_id}</p>
                )}
              </div>
            </div>

            {user?.telegram_id && (
              <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Telegram подключен</h3>
                </div>
                {user.telegram_username && (
                  <p className="text-blue-400 font-semibold text-xs">@{user.telegram_username}</p>
                )}
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <h2 className="text-sm font-bold text-white mb-3">Информация профиля</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Имя</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Новый пароль</label>
                <input
                  type="password"
                  placeholder="Оставьте пустым, чтобы не менять"
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-xl font-semibold text-sm shadow-lg">
                Сохранить изменения
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-red-500/20 to-pink-600/20 hover:from-red-500/30 hover:to-pink-600/30 text-red-300 hover:text-white rounded-2xl transition-all font-semibold border border-red-400/20"
          >
            <LogOut className="w-5 h-5" />
            Выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  );
}
