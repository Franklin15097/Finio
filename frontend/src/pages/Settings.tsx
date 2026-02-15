import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Percent, Save, Sparkles } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('distribution');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'distribution', label: 'Распределение', icon: Percent, gradient: 'from-purple-500 to-pink-600' },
    { id: 'profile', label: 'Профиль', icon: User, gradient: 'from-blue-500 to-indigo-600' },
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-3xl flex items-center justify-center shadow-xl">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">
            Настройки
          </h1>
          <p className="text-white/80 text-lg">Управление аккаунтом и распределением</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-3xl p-4">
            <nav className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                      isActive ? 'scale-105' : 'hover:scale-105'
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient}`}></div>
                    )}
                    <div className={`relative flex items-center gap-3 px-4 py-3 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                    }`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'distribution' && (
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Распределение доходов</h2>
                  <p className="text-gray-400 text-sm">
                    Укажите процент от доходов для каждого счёта
                  </p>
                </div>
                <button
                  onClick={saveDistribution}
                  disabled={saving}
                  className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-purple-600/90 to-fuchsia-600/90 rounded-3xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-purple-500/50 backdrop-blur-sm border border-purple-400/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <Save className="w-5 h-5" />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </div>
                </button>
              </div>

              {/* Total Percentage Indicator */}
              <div className={`mb-8 p-6 rounded-2xl transition-all ${
                Math.abs(totalPercentage - 100) < 0.01 
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30' 
                  : 'bg-gradient-to-r from-red-500/20 to-pink-600/20 border border-red-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-lg">Общая сумма процентов:</span>
                  <span className={`text-4xl font-bold ${
                    Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {totalPercentage.toFixed(2)}%
                  </span>
                </div>
                {Math.abs(totalPercentage - 100) >= 0.01 && (
                  <p className="text-sm text-red-400 mt-3">
                    Сумма должна быть 100%. Осталось: {(100 - totalPercentage).toFixed(2)}%
                  </p>
                )}
              </div>

              {/* Accounts List */}
              <div className="space-y-4">
                {accounts.map((account, index) => (
                  <div
                    key={account.id}
                    className="bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-2xl">
                          {account.icon === 'wallet' && '💳'}
                          {account.icon === 'card' && '💳'}
                          {account.icon === 'bank' && '🏦'}
                          {account.icon === 'savings' && '🐷'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{account.name}</p>
                          <p className="text-sm text-gray-400 capitalize">{account.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={account.percentage}
                          onChange={(e) => handlePercentageChange(account.id, e.target.value)}
                          className="w-28 px-4 py-3 text-right bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <span className="text-gray-400 font-semibold text-xl">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {accounts.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Percent className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-400 text-lg">Нет счетов для настройки</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Создайте счета на странице "Баланс"
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">Информация профиля</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-75"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold transition-all">
                    Изменить аватар
                  </button>
                </div>

                {/* Telegram Connection Status */}
                {user?.telegram_id && (
                  <div className="p-6 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                      <h3 className="text-lg font-bold text-white">Telegram подключен</h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">
                      Ваш аккаунт связан с Telegram
                    </p>
                    {user.telegram_username && (
                      <p className="text-blue-400 font-semibold">
                        @{user.telegram_username}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Имя</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Новый пароль</label>
                  <input
                    type="password"
                    placeholder="Оставьте пустым, чтобы не менять"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300">
                  Сохранить изменения
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
